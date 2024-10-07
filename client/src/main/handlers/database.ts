import { app, ipcMain } from 'electron';
import { IPCRoute } from '@/shared/constants';
import { machineIdSync } from 'node-machine-id';
import { getIPAddress, getNetworkNames } from '../lib/ipaddress';
import { v4 as uuidv4 } from 'uuid';
import { Quiz, QuizQuestion, QuizRecord, Subject } from '@prisma/client';
import { sleep } from '@/shared/utils';
import { getSocketInstance, reconnectSocket } from '../lib/socket-manager';
import { Database, WindowManager } from '../lib';
import Store from 'electron-store';

const store = new Store();

export default function () {
  // database connection handlers with faux timeout
  ipcMain.handle(IPCRoute.DATABASE_CONNECT, (_, id?: string) =>
    sleep(2000).then(() => {
      Database.connect(store.get('databaseUrl') as string);
      return Promise.resolve();
    })
  );

  ipcMain.handle(IPCRoute.DATABASE_DISCONNECT, () =>
    sleep(2000).then(() => Database.prisma.$disconnect())
  );

  ipcMain.on(IPCRoute.DATABASE_CHECK_CONNECTION, (e, serverAddress: string) => {
    console.log("connection", serverAddress)
  });

  ipcMain.handle(IPCRoute.DEVICE_VERIFY_HOST_NAME, (e, hostName: string, id?: string) => {
    sleep(2000).then(() => {
      Database.connect(`mysql://eduinsight_user:eduinsight_pass@${hostName}:3306/eduinsight`);
      return Promise.resolve();
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_VERIFY_DEVICE, async (e) => {
    const deviceId = store.get('deviceId') as string;

    if (!deviceId) {
      return Promise.reject('Device not found');
    }

    const device = await Database.prisma.device.findFirst({ where: { id: deviceId } });

    if (device) {
      return Promise.resolve(device);
    } else {
      return Promise.reject('Device not found');
    }
  });

  ipcMain.handle(IPCRoute.DATABASE_CHECK_ACTIVE_USER, async (e) => {
    const device = await Database.prisma.device.findFirst({ where: { devMACaddress: machineIdSync(true) } });
    const activeUser = await Database.prisma.activeDeviceUser.findFirst({ where: { deviceId: device?.id } });
    if (activeUser) {
      store.set('userId', activeUser.userId);
    } else {
      store.delete('userId');
    }
    return Promise.resolve(activeUser);
  });

  ipcMain.handle(IPCRoute.DATABASE_REGISTER_DEVICE, async (e, deviceName: string, labId: string, networkName: string) => {
    const ipAddress = getIPAddress()
    const device = await Database.prisma.device.create({
      data: {
        name: deviceName,
        devId: uuidv4(),
        devHostname: ipAddress[networkName][0],
        devMACaddress: machineIdSync(true),
        isArchived: false,
        labId: labId
      }
    })
    store.set('deviceId', device.id);
    reconnectSocket();
    return Promise.resolve();
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_LABS, () => {
    try {
      const labs = Database.prisma.labaratory.findMany()
      return Promise.resolve(labs);
    } catch (error) {
      return Promise.reject(error);
    }
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_NETWORK_NAMES, () =>
    getNetworkNames()
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_DEVICE, () =>
    Database.prisma.device.findMany({ where: { devMACaddress: machineIdSync(true) } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_DEVICE_BY_MAC, (e, devMACaddress: string) =>
    Database.prisma.device.findMany({ where: { devMACaddress } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_DEVICE_BY_ID, (e, id: string) =>
    Database.prisma.device.findMany({ where: { id } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_ACTIVE_USER_BY_DEVICE_ID_AND_LAB_ID, (e, deviceId: string, labId: string) =>
    Database.prisma.activeDeviceUser.findMany({ where: { deviceId, labId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_DEVICE_USER_BY_ACTIVE_USER_ID, (e, userId: string) =>
    Database.prisma.deviceUser.findMany({ where: { id: userId }, include: { subjects: true } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_ALL_DEVICE_USERS_BY_LAB_ID, (e, labId: string) =>
    Database.prisma.deviceUser.findMany({ where: { labId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_ALL_ACTIVE_DEVICE_USERS_BY_LAB_ID, (e, labId: string) =>
    Database.prisma.activeDeviceUser.findMany({ where: { labId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_SUBJECTS_BY_LAB_ID, (e, labId: string) =>
    Database.prisma.subject.findMany({ where: { labId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_SUBJECTS_BY_USER_ID, (e, userId: string) => {
    Database.prisma.subject.findMany({ where: { userId } });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_USER_RECENT_LOGIN_BY_USER_ID, (e, userId: string) =>
    Database.prisma.activeUserLogs.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  );

  ipcMain.handle(IPCRoute.DATABASE_CREATE_SUBJECT, async (e, subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await Database.prisma.subject.create({
      data: subject
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_SUBJECT_DATA, async (e, subjectId: string) => {
    return await Database.prisma.subject.findMany({ where: { id: subjectId } });
  });



  ipcMain.handle(IPCRoute.DATABASE_GET_SUBJECT_RECORDS_BY_SUBJECT_ID, async (e, subjectId: string) => {
    return await Database.prisma.subjectRecord.findMany({ where: { subjectId } });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_ACTIVE_USERS_BY_SUBJECT_ID, async (e, subjectId: string) => {
    const subjectRecords = await Database.prisma.subjectRecord.findMany({ where: { subjectId } });
    return await Database.prisma.activeDeviceUser.findMany({ where: { userId: { in: subjectRecords.map(record => record.userId) } } });
  });

  ipcMain.on(IPCRoute.DATABASE_USER_LOGOUT, async (e, userId: string, deviceId: string) => {
    await Database.prisma.activeDeviceUser.deleteMany({
      where: {
        deviceId,
        userId
      }
    });

    await Database.prisma.device.update({ where: { id: deviceId }, data: { isUsed: false } })

    // Get the socket instance
    const socket = getSocketInstance();

    // Emit the logout event to the server
    if (socket && socket.connected) {
      socket.emit('logout-user');
    }

    // Clear the userId from the store
    store.set('userId', null);

    WindowManager.get(WindowManager.WINDOW_CONFIGS.main_window.id);
  })

  ipcMain.on(IPCRoute.DATABASE_DELETE_SUBJECT, async (e, subjectId: string) => {
    await Database.prisma.subject.delete({
      where: { id: subjectId }
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_STUDENT_SUBJECTS, async (e, studentId: string) => {
    const subjectRecords = await Database.prisma.subjectRecord.findMany({ where: { userId: studentId } });
    const subjects = await Database.prisma.subject.findMany({
      where: { id: { in: subjectRecords.map(record => record.subjectId) } },
      include: {
        quizzes: true,
        activities: true,
        quizRecord: true,
        activityRecord: true
      }
    });
    return subjects;
  });


  ipcMain.handle(IPCRoute.DATABASE_JOIN_SUBJECT, async (e, subjectCode: string, studentId: string, labId: string) => {
    const subject = await Database.prisma.subject.findFirst({ where: { subjectCode } });
    if (!subject) {
      return { success: false, message: 'Subject not found' };
    }
    try {
      await Database.prisma.subjectRecord.create({
        data: {
          subjectId: subject.id,
          userId: studentId,
          labId: labId
        }
      });
      return { success: true, message: 'Subject joined successfully' };
    } catch (error) {
      console.error('Error joining subject:', error);
      return { success: false, message: 'Failed to join subject' };
    }
  });


  ipcMain.handle(IPCRoute.DATABASE_LEAVE_SUBJECT, async (e, subjectId: string, studentId: string) => {
    try {
      await Database.prisma.subjectRecord.deleteMany({
        where: {
          subjectId: subjectId,
          userId: studentId
        }
      });
      return { success: true, message: 'Subject left successfully' };
    } catch (error) {
      console.error('Error leaving subject:', error);
      return { success: false, message: 'Failed to leave subject' };
    }
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_QUIZZES_BY_USER_ID, async (e, userId: string) => {
    return await Database.prisma.quiz.findMany({
      where: { userId },
      include: {
        questions: true,
        subject: true
      }
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_QUIZ_BY_ID, async (e, quizId: string) => {
    return await Database.prisma.quiz.findMany({
      where: { id: quizId },
      include: { questions: true }
    });
  });

  ipcMain.on(IPCRoute.DATABASE_DELETE_QUIZ, async (e, quizId: string) => {
    await Database.prisma.quiz.delete({
      where: { id: quizId },
      include: { questions: true }
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_CREATE_QUIZ, async (e, quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await Database.prisma.quiz.create({
      data: quiz
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_UPDATE_QUIZ, async (e, quizId: string, quiz: Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return await Database.prisma.quiz.update({
      where: { id: quizId },
      data: quiz
    });
  });

  ipcMain.on(IPCRoute.DATABASE_PUBLISH_QUIZ, async (e, quizId: string) => {
    await Database.prisma.quiz.update({
      where: { id: quizId },
      data: { published: true }
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_CREATE_QUIZ_QUESTION, async (e, quizId: string, question: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const createdQuestion = await Database.prisma.quizQuestion.create({
        data: {
          ...question,
          quizId
        }
      });
      return createdQuestion;
    } catch (error) {
      console.error('Error creating quiz question:', error);
      return null;
    }
  });

  ipcMain.handle(IPCRoute.DATABASE_UPDATE_QUIZ_QUESTION, async (e, questionId: string, question: Partial<Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return await Database.prisma.quizQuestion.update({
      where: { id: questionId },
      data: question
    });
  });


  ipcMain.on(IPCRoute.DATABASE_DELETE_QUIZ_QUESTION, async (e, questionId: string) => {
    await Database.prisma.quizQuestion.delete({
      where: { id: questionId }
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_SAVE_QUIZ_RECORD, async (e, quizRecord: Omit<QuizRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await Database.prisma.quizRecord.create({
      data: quizRecord
    });
  });


}
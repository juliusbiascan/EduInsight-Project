import { ipcMain } from 'electron';
import { IPCRoute } from '@/shared/constants';
import { db } from '@/shared/db';
import { machineIdSync } from 'node-machine-id';
import { getIPAddress, getNetworkNames } from '../lib/ipaddress';
import { v4 as uuidv4 } from 'uuid';
import { Quiz, QuizQuestion, Subject } from '@prisma/client';

export default function () {

  ipcMain.on(IPCRoute.DATABASE_CHECK_CONNECTION, (e, serverAddress: string) => {
    console.log("connection", serverAddress)
  })

  ipcMain.handle(IPCRoute.DATABASE_GET_LABS, () =>
    db.labaratory.findMany()
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_NETWORK_NAMES, () =>
    getNetworkNames()
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_DEVICE, () =>
    db.device.findMany({ where: { devMACaddress: machineIdSync(true) } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_DEVICE_BY_MAC, (e, devMACaddress: string) =>
    db.device.findMany({ where: { devMACaddress } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_DEVICE_BY_ID, (e, id: string) =>
    db.device.findMany({ where: { id } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_ACTIVE_USER_BY_DEVICE_ID_AND_LAB_ID, (e, deviceId: string, labId: string) =>
    db.activeDeviceUser.findMany({ where: { deviceId, labId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_DEVICE_USER_BY_ACTIVE_USER_ID, (e, userId: string) =>
    db.deviceUser.findMany({ where: { id: userId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_ALL_DEVICE_USERS_BY_LAB_ID, (e, labId: string) =>
    db.deviceUser.findMany({ where: { labId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_ALL_ACTIVE_DEVICE_USERS_BY_LAB_ID, (e, labId: string) =>
    db.activeDeviceUser.findMany({ where: { labId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_SUBJECTS_BY_LAB_ID, (e, labId: string) =>
    db.subject.findMany({ where: { labId } })
  );

  ipcMain.handle(IPCRoute.DATABASE_GET_USER_RECENT_LOGIN_BY_USER_ID, (e, userId: string) =>
    db.activeUserLogs.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  );

  ipcMain.handle(IPCRoute.DATABASE_CREATE_SUBJECT, async (e, subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await db.subject.create({
      data: subject
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_SUBJECT_DATA, async (e, subjectId: string) => {
    return await db.subject.findMany({ where: { id: subjectId } });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_SUBJECT_RECORDS_BY_SUBJECT_ID, async (e, subjectId: string) => {
    return await db.subjectRecord.findMany({ where: { subjectId } });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_ACTIVE_USERS_BY_SUBJECT_ID, async (e, subjectId: string) => {
    const subjectRecords = await db.subjectRecord.findMany({ where: { subjectId } });
    return await db.activeDeviceUser.findMany({ where: { userId: { in: subjectRecords.map(record => record.userId) } } });
  });

  ipcMain.on(IPCRoute.DATABASE_USER_LOGOUT, async (e, userId: string, deviceId: string) => {
    await db.activeDeviceUser.deleteMany({
      where: {
        deviceId,
        userId
      }
    });
    await db.device.update({ where: { id: deviceId }, data: { isUsed: false } })
  })

  ipcMain.on(IPCRoute.DATABASE_DELETE_SUBJECT, async (e, subjectId: string) => {
    await db.subject.delete({
      where: { id: subjectId }
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_STUDENT_SUBJECTS, async (e, studentId: string) => {
    const subjectRecords = await db.subjectRecord.findMany({ where: { userId: studentId } });
    const subjects = await db.subject.findMany({ where: { id: { in: subjectRecords.map(record => record.subjectId) } } });
    return subjects;
  });

  ipcMain.handle(IPCRoute.DATABASE_JOIN_SUBJECT, async (e, subjectCode: string, studentId: string, labId: string) => {
    const subject = await db.subject.findFirst({ where: { subjectCode } });
    if (!subject) {
      return { success: false, message: 'Subject not found' };
    }
    try {
      await db.subjectRecord.create({
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

  ipcMain.on(IPCRoute.DATABASE_REGISTER_DEVICE, async (e, deviceName: string, labId: string, networkName: string) => {
    const ipAddress = getIPAddress()
    await db.device.create({
      data: {
        name: deviceName,
        devId: uuidv4(),
        devHostname: ipAddress[networkName][0],
        devMACaddress: machineIdSync(true),
        isArchived: false,
        labId: labId
      }
    })
    e.reply(IPCRoute.DATABASE_REGISTER_DEVICE, { success: true })
  });

  ipcMain.handle(IPCRoute.DATABASE_LEAVE_SUBJECT, async (e, subjectId: string, studentId: string) => {
    try {
      await db.subjectRecord.deleteMany({
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
    return await db.quiz.findMany({
      where: { userId },
      include: {
        questions: true
      }
    });
  });

  ipcMain.on(IPCRoute.DATABASE_DELETE_QUIZ, async (e, quizId: string) => {
    await db.quiz.delete({
      where: { id: quizId },
      include: { questions: true }
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_CREATE_QUIZ, async (e, quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await db.quiz.create({
      data: quiz
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_GET_QUIZ_BY_ID, async (e, quizId: string) => {
    return await db.quiz.findMany({
      where: { id: quizId },
      include: { questions: true }
    });
  });

  ipcMain.handle(IPCRoute.DATABASE_CREATE_QUIZ_QUESTION, async (e, quizId: string, question: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const createdQuestion = await db.quizQuestion.create({
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
}
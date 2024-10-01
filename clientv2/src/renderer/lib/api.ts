import { ActiveDeviceUser, ActiveUserLogs, Device, DeviceUser, Labaratory, Quiz, QuizQuestion, Subject, SubjectRecord } from '@prisma/client';
import { IPCRoute } from '../../shared/constants';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import type AppInfo from 'package.json';

export default {
  app: {
    info: () => ipcRenderer.invoke(IPCRoute.APP_INFO) as Promise<typeof AppInfo>,
  },
  updater: {
    install: () => ipcRenderer.send(IPCRoute.UPDATER_INSTALL),
    on: (eventName: string, cb: () => void) => ipcRenderer.on(eventName, cb),
    start: () => ipcRenderer.send(IPCRoute.UPDATER_START),
  },
  window: {
    close: (id: string) => ipcRenderer.send(IPCRoute.WINDOW_CLOSE, id),
    hide: (id: string) => ipcRenderer.send(IPCRoute.WINDOW_HIDE, id),
    open: (id: string) => ipcRenderer.send(IPCRoute.WINDOW_OPEN, id),
    send: <T = unknown>(id: string, data: T) => ipcRenderer.send(IPCRoute.WINDOW_SEND, id, data),
  },
  database: {
    checkConnection: (serverAddress: string) => ipcRenderer.send(IPCRoute.DATABASE_CHECK_CONNECTION, serverAddress),
    registerDevice: (deviceName: string, labId: string, networkName: string) => ipcRenderer.send(IPCRoute.DATABASE_REGISTER_DEVICE, deviceName, labId, networkName),
    getNetworkNames: () => ipcRenderer.invoke(IPCRoute.DATABASE_GET_NETWORK_NAMES) as Promise<Array<string>>,
    getLabs: () => ipcRenderer.invoke(IPCRoute.DATABASE_GET_LABS) as Promise<Array<Labaratory>>,
    getDevice: () => ipcRenderer.invoke(IPCRoute.DATABASE_GET_DEVICE) as Promise<Array<Device>>,
    getDeviceByMac: (macAddress: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_DEVICE_BY_MAC, macAddress) as Promise<Array<Device>>,
    getDeviceById: (id: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_DEVICE_BY_ID, id) as Promise<Array<Device>>,
    getActiveUserByDeviceId: (deviceId: string, labId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_ACTIVE_USER_BY_DEVICE_ID_AND_LAB_ID, deviceId, labId) as Promise<Array<ActiveDeviceUser>>,
    getDeviceUserByActiveUserId: (userId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_DEVICE_USER_BY_ACTIVE_USER_ID, userId) as Promise<Array<DeviceUser>>,
    getUserRecentLoginByUserId: (userId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_USER_RECENT_LOGIN_BY_USER_ID, userId) as Promise<Array<ActiveUserLogs>>,
    getAllDeviceUsersByLabId: (labId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_ALL_DEVICE_USERS_BY_LAB_ID, labId) as Promise<Array<DeviceUser>>,
    getAllActiveDeviceUsersByLabId: (labId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_ALL_ACTIVE_DEVICE_USERS_BY_LAB_ID, labId) as Promise<Array<ActiveDeviceUser>>,
    getSubjectsByLabId: (labId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_SUBJECTS_BY_LAB_ID, labId) as Promise<Array<Subject>>,
    getSubjectById: (subjectId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_SUBJECT_BY_ID, subjectId) as Promise<Array<Subject>>,
    userLogout: (userId: string, deviceId: string) => ipcRenderer.send(IPCRoute.DATABASE_USER_LOGOUT, userId, deviceId),
    createSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke(IPCRoute.DATABASE_CREATE_SUBJECT, subject) as Promise<Subject>,
    deleteSubject: (subjectId: string) => ipcRenderer.send(IPCRoute.DATABASE_DELETE_SUBJECT, subjectId),
    getStudentSubjects: (studentId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_STUDENT_SUBJECTS, studentId) as Promise<Array<Subject>>,
    getSubjectData: (subjectId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_SUBJECT_DATA, subjectId) as Promise<Array<Subject>>,
    getSubjectRecordsBySubjectId: (subjectId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_SUBJECT_RECORDS_BY_SUBJECT_ID, subjectId) as Promise<Array<SubjectRecord>>,
    getActiveUsersBySubjectId: (subjectId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_ACTIVE_USERS_BY_SUBJECT_ID, subjectId) as Promise<Array<ActiveDeviceUser>>,
    getQuizzesByUserId: (userId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_QUIZZES_BY_USER_ID, userId) as Promise<Array<Quiz & { questions: Array<QuizQuestion> }>>,
    getQuizById: (quizId: string) => ipcRenderer.invoke(IPCRoute.DATABASE_GET_QUIZ_BY_ID, quizId) as Promise<Array<Quiz & { questions: Array<QuizQuestion> }>>,
    deleteQuiz: (quizId: string) => ipcRenderer.send(IPCRoute.DATABASE_DELETE_QUIZ, quizId),
    createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke(IPCRoute.DATABASE_CREATE_QUIZ, quiz) as Promise<Quiz>,
    createQuizQuestionByQuizId: (quizId: string, question: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke(IPCRoute.DATABASE_CREATE_QUIZ_QUESTION, quizId, question) as Promise<QuizQuestion>,
    joinSubject: (subjectCode: string, studentId: string, labId: string) =>
      ipcRenderer.invoke(IPCRoute.DATABASE_JOIN_SUBJECT, subjectCode, studentId, labId) as Promise<{ success: boolean, message: string }>,
    leaveSubject: (subjectId: string, studentId: string) =>
      ipcRenderer.invoke(IPCRoute.DATABASE_LEAVE_SUBJECT, subjectId, studentId) as Promise<{ success: boolean, message: string }>,

  },
  device: {
    getMacAddress: (callback: (event: IpcRendererEvent, macAddress: string) => void) => ipcRenderer.on('SET_MAC', callback),
    getUserState: (callback: (event: IpcRendererEvent, state: number) => void) => ipcRenderer.on('SET_STATE', callback),
    mouseMove: ({ clientX, clientY, clientWidth, clientHeight }: { clientX: number, clientY: number, clientWidth: number, clientHeight: number }) => ipcRenderer.send('mouse_move', { clientX, clientY, clientWidth, clientHeight }),
    mouseClick: (button: string) => ipcRenderer.send('mouse_click', button),
    mouseScroll: ({ deltaX, deltaY }: { deltaX: number, deltaY: number }) => ipcRenderer.send('mouse_scroll', { deltaX, deltaY }),
    mouseDrag: ({ direction, clientX, clientY, clientWidth, clientHeight }: { direction: string, clientX: number, clientY: number, clientWidth: number, clientHeight: number }) => ipcRenderer.send('mouse_drag', { direction, clientX, clientY, clientWidth, clientHeight }),
    keyPress: (key: string) => ipcRenderer.send('key_press', key)
  }
};
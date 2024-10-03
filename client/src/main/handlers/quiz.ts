import { IPCRoute, WindowIdentifier } from "@/shared/constants";
import { WindowManager } from "../lib";
import { ipcMain } from "electron";
import { sleep } from "@/shared/utils";

export default function () {
  ipcMain.on(IPCRoute.QUIZ_PLAY, (_, quizId: string) => {
    const quiz = WindowManager.get(WindowIdentifier.QuizPlayer);
    sleep(2000).then(() => {
      if (quiz) {
        quiz.webContents.send(IPCRoute.QUIZ_GET_QUIZ_ID, quizId);
      }
    });
  });
}
import { activeWindow, Result } from 'get-windows';
import { powerMonitor } from "electron";
import { Database } from '.';

let interval: NodeJS.Timeout;


function getTimeStamp() {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;

  return dateTime;
}

async function pushPowerLogsToDB(pm_status: string, pm_log_ts: string, userId: string, deviceId: string, labId: string) {
  await Database.prisma.powerMonitoringLogs.create({
    data: {
      pm_status,
      pm_log_ts,
      userId,
      deviceId,
      labId
    }
  })
}

export function setPowerMonitor(userId: string, deviceId: string, labId: string) {

  let currentWindow: number;

  interval = setInterval(async function () {

    await activeWindow().then(async (result: Result) => {

      const newWindow = result.id;

      if (currentWindow !== newWindow) {

        await Database.prisma.activityLogs.create({

          data: {
            userId,
            deviceId,
            labId,
            title: result.title,
            ownerName: result.owner.name,
            ownerPath: result.owner.path,
            memoryUsage: result.memoryUsage,
          }
        });
        currentWindow = result.id;
      }
    });
  }, 1000);

  powerMonitor.on("suspend", () => {
    console.log("The system is going to sleep");
    pushPowerLogsToDB("0", getTimeStamp(), userId, deviceId, labId);
  });

  powerMonitor.on("resume", () => {
    console.log("The system is resuming");
    pushPowerLogsToDB("1", getTimeStamp(), userId, deviceId, labId);
  });

  powerMonitor.on("on-ac", () => {
    console.log("The system is on AC Power (charging)");
    pushPowerLogsToDB("2", getTimeStamp(), userId, deviceId, labId);
  });

  powerMonitor.on("on-battery", () => {
    console.log("The system is on Battery Power");
    pushPowerLogsToDB("3", getTimeStamp(), userId, deviceId, labId);
  });

  powerMonitor.on("shutdown", () => {
    console.log("The system is Shutting Down");
    pushPowerLogsToDB("4", getTimeStamp(), userId, deviceId, labId);
  });

  powerMonitor.on("lock-screen", () => {
    console.log("The system is about to be locked");
    pushPowerLogsToDB("5", getTimeStamp(), userId, deviceId, labId);
  });

  powerMonitor.on("unlock-screen", () => {
    console.log("The system is unlocked");
    pushPowerLogsToDB("6", getTimeStamp(), userId, deviceId, labId);
  });
}

export const stopPowerMonitoring = (): void => {
  clearInterval(interval);
  powerMonitor.removeAllListeners("suspend");
  powerMonitor.removeAllListeners("resume");
  powerMonitor.removeAllListeners("on-ac");
  powerMonitor.removeAllListeners("on-battery");
  powerMonitor.removeAllListeners("shutdown");
  powerMonitor.removeAllListeners("lock-screen");
  powerMonitor.removeAllListeners("unlock-screen");
}


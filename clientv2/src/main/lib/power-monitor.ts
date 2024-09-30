import axios from "axios";
import { powerMonitor } from "electron";
import { machineIdSync } from 'node-machine-id';
import https from "https";
import { API } from "../../shared/constants";

function getTimeStamp() {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;

  return dateTime;
}

export async function logOutUser() {

  const macAddress = machineIdSync(true);

  try {
    const { status, data } = await axios.delete(`${API.URL}/api/clients/logout/${macAddress}`, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      })
    });
    console.log(data, status);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  }
}

async function pushPowerLogsToDB(pm_status: string, pm_log_ts: string) {
  const macAddress = machineIdSync(true)
  try {
    const { status } = await axios.post(`${API.URL}/api/clients/power-monitoring-logs`, { macAddress, pm_status, pm_log_ts }, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      })
    });

    console.log("[PUSH-PM-LOGS]", status);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  }
}

export function setPowerMonitor() {
  powerMonitor.on("suspend", () => {
    console.log("The system is going to sleep");
    pushPowerLogsToDB("0", getTimeStamp());
  });

  powerMonitor.on("resume", () => {
    console.log("The system is resuming");
    pushPowerLogsToDB("1", getTimeStamp());
  });

  powerMonitor.on("on-ac", () => {
    console.log("The system is on AC Power (charging)");
    pushPowerLogsToDB("2", getTimeStamp());
  });

  powerMonitor.on("on-battery", () => {
    console.log("The system is on Battery Power");
    pushPowerLogsToDB("3", getTimeStamp());
  });

  powerMonitor.on("shutdown", () => {
    console.log("The system is Shutting Down");
    pushPowerLogsToDB("4", getTimeStamp());
  });

  powerMonitor.on("lock-screen", () => {
    console.log("The system is about to be locked");
    pushPowerLogsToDB("5", getTimeStamp());
  });

  powerMonitor.on("unlock-screen", () => {
    console.log("The system is unlocked");
    pushPowerLogsToDB("6", getTimeStamp());
  });
}

export const stopPowerMonitoring = (): void => {
  powerMonitor.removeAllListeners("suspend");
  powerMonitor.removeAllListeners("resume");
  powerMonitor.removeAllListeners("on-ac");
  powerMonitor.removeAllListeners("on-battery");
  powerMonitor.removeAllListeners("shutdown");
  powerMonitor.removeAllListeners("lock-screen");
  powerMonitor.removeAllListeners("unlock-screen");
}


import { machineIdSync } from 'node-machine-id';
import axios from 'axios';
import { activeWindow, Result } from 'get-windows';
import https from 'https';
import { API } from '../../shared/constants';

let interval: NodeJS.Timeout;

export const setActivityMonitoring = (): void => {

  let currentWindow: number;

  interval = setInterval(async function () {

    const macAddress = machineIdSync(true);

    await activeWindow().then(async (result: Result) => {

      const newWindow = result.id;

      if (currentWindow !== newWindow) {

        const data = {
          macAddress,
          os: result.title,
          windowClass: result.owner.path,
          windowName: result.owner.name,
          al_log_ts: new Date().toISOString(),
        }

        await axios.post(`${API.URL}/api/clients/activitylogs`, data, {
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          })
        });

        currentWindow = result.id;
      }
    });
  }, 1000);
}

export const stopActivityMonitoring = (): void => {
  clearInterval(interval);
}


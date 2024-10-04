/**
 * @file index.ts
 * @description Main entry point for the EduInsight Client application.
 * This file sets up the Electron app, handles window management, user sessions, and various system events.
 */

import AutoLaunch from 'auto-launch';
import { app, BrowserWindow, desktopCapturer, screen } from 'electron';
import { createTray, removeTray } from './lib/tray-menu';
import { createWelcomeWindow } from './lib/window-manager';
import path from 'path';
import { machineIdSync } from 'node-machine-id';
import { db } from '../shared/db';
import { Device, DeviceUser, Prisma } from '@prisma/client';
import { WindowManager } from './lib';
import * as IPCHandlers from './handlers';
import is from 'electron-is';
import { Socket } from "socket.io-client";
import * as robot from "@jitsi/robotjs";
import { createSocketConnection } from './lib/socket-manager';

/**
 * Handles the 'ready' event of the app.
 * Sets up IPC handlers and creates the system tray icon.
 */
function handleOnReady() {
  // register all ipc handlers before creating the app window
  Object.values(IPCHandlers).forEach((handler) => handler());
}

/**
 * Handles the scenario when no device is found in the database.
 * Opens the splash window.
 */
let setUpDevice: boolean = false;
function handleNoDeviceFound() {
  if (!setUpDevice) {
    setUpDevice = true;
    WindowManager.get(WindowManager.WINDOW_CONFIGS.splash_window.id);
  }
}

/**
 * Handles unexpected errors.
 * Opens the "Something Went Wrong" window.
 * @param {any} error - The error that occurred.
 */
function handleSomethingWentWrong(error: any) {
  WindowManager.get(WindowManager.WINDOW_CONFIGS.sww_window.id);
}

/**
 * Handles the scenario when the server is down.
 * Opens the "Server Down" window.
 */
function handleServerDown() {
  WindowManager.get(WindowManager.WINDOW_CONFIGS.down_window.id);
}

let ws: Socket | null = null;
let previousUserId: string | null = null;

/**
 * Handles the scenario when there's an active user.
 * Starts various services and shows the welcome window.
 * @param {DeviceUser} user - The active user.
 */
function handleActiveUser(user: DeviceUser, device: Device) {
  if (!previousUserId || previousUserId !== user.id) {
    console.log('Active user');

    // Create socket connection
    ws = createSocketConnection(device.id);

    // Set up socket event listeners
    setupSocketEventListeners(ws, device.id);

    createTray(path.join(__dirname, 'img/tray-icon.ico'));
    createWelcomeWindow(user.firstName, user.lastName);
    // setPowerMonitoring(user.id, device.id, device.labId);
    // setActivityMonitoring(user.id, device.id, device.labId);
    WindowManager.get(WindowManager.WINDOW_CONFIGS.main_window.id).close()

    previousUserId = user.id;
  }
}

/**
 * Handles the scenario when there's no active user.
 * Stops various services and shows the main window.
 * @param {string} devId - The device ID.
 */
function handleNoActiveUser(devId: string) {
  if (!previousUserId || previousUserId !== devId) {

    // stopActivityMonitoring();
    // stopPowerMonitoring();

    if (ws) {
      ws.emit("stop-sharing", devId);
      ws.disconnect();
      ws = null;
    }

    removeTray();
    console.log('No active user');
    WindowManager.get(WindowManager.WINDOW_CONFIGS.main_window.id)
    previousUserId = devId;
  }
}

/**
 * Handles the 'window-all-closed' event.
 * Quits the app on all platforms except macOS.
 */
function handleAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

/**
 * Handles the 'activate' event on macOS.
 * Creates a new window if no windows are open.
 */
function handleOnActivate() {
  if (BrowserWindow.getAllWindows().length === 0) {
    WindowManager.get(WindowManager.WINDOW_CONFIGS.main_window.id);
  }
}

/**
 * Main application logic wrapped in an async IIFE.
 * Sets up auto-launch, event listeners, and runs the main application loop.
 */
(async () => {
  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require('electron-squirrel-startup')) {
    app.quit();
  }

  const autoLaunch = new AutoLaunch({
    name: 'EduInsight Client',
    path: app.getPath('exe'),
  });

  if (is.production()) {
    autoLaunch.isEnabled().then((isEnabled) => {
      if (!isEnabled) autoLaunch.enable();
    });
  }

  app.on('ready', () => {
    handleOnReady();
    const interval = setInterval(async () => {
      try {
        const device = await db.device.findFirst({
          where: {
            devMACaddress: machineIdSync(true),
          }
        });

        if (!device) {
          handleNoDeviceFound();
        } else {
          const activeUsers = await db.activeDeviceUser.findFirst({
            where: {
              deviceId: device.id,
            }
          });

          if (!activeUsers) {
            handleNoActiveUser(device.id);
          } else {
            const user = await db.deviceUser.findUnique({
              where: {
                id: activeUsers.userId,
              }
            });
            if (user) {
              handleActiveUser(user, device);
            }
          }
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientInitializationError) {
          handleServerDown();
        } else {
          handleSomethingWentWrong(error);
        }

      }
    }, 1000);
  });
  app.on('window-all-closed', async () => {
    const device = await db.device.findFirst({
      where: {
        devMACaddress: machineIdSync(true),
      }
    });
    if (!device) {
      handleAllClosed();
    }
  });
  app.on('activate', handleOnActivate);

})();

let captureInterval: NodeJS.Timeout | null = null;

function startScreenCapture(deviceId: string) {
  if (captureInterval) {
    clearInterval(captureInterval);
  }

  captureInterval = setInterval(() => {
    desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } })
      .then(sources => {
        const source = sources[0];
        const base64 = source.thumbnail.toDataURL();
        ws.emit('screen-share', { deviceId, screenData: base64 });
      })
      .catch(error => {
        console.error('Error capturing screen:', error);
      });
  }, 1000); // Capture every second
}

function stopScreenCapture() {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
  }
}

function setupSocketEventListeners(socket: Socket, deviceId: string) {
  socket.on('connect', () => {
    socket.emit('join-server', deviceId);
  });

  socket.on('start_sharing', () => {
    console.log("Starting screen sharing for device:", deviceId);
    startScreenCapture(deviceId);
  });

  socket.on('stop_sharing', stopScreenCapture);

  socket.on('mouse_move', ({ clientX, clientY, clientWidth, clientHeight }) => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const hostX = clientX * width / clientWidth;
    const hostY = clientY * height / clientHeight;

    robot.moveMouse(hostX, hostY);
  });

  socket.on('mouse_click', (data) => {
    if (data) {
      robot.mouseClick(data.button, data.double);
    }
  });

  socket.on('mouse_scroll', ({ deltaX, deltaY }) => {
    robot.scrollMouse(deltaX, deltaY);
  });

  let mouseDirection: string | null = null;

  socket.on('mouse_drag', ({ direction, clientX, clientY, clientWidth, clientHeight }) => {
    if (direction !== mouseDirection) {
      mouseDirection = direction;
      robot.mouseToggle(direction);
    }
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const hostX = clientX * width / clientWidth;
    const hostY = clientY * height / clientHeight;

    robot.dragMouse(hostX, hostY);
  });

  socket.on('keyboard', (keys) => {
    try {
      if (keys[1].length > 0 && (keys[0].toLowerCase() !== keys[1][0].toLowerCase())) {
        robot.keyToggle(keys[0], "down", keys[1]);
        robot.keyToggle(keys[0], "up", keys[1]);
      } else if (keys[1].length === 0) {
        robot.keyTap(keys[0]);
      }
    } catch (e) {
      console.error(e);
    }
  });

  // Add error and disconnect handlers
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
  });
}

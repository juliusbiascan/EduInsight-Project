/**
 * @file index.ts
 * @description Main entry point for the EduInsight Client application.
 * This file sets up the Electron app, handles window management, user sessions, and various system events.
 */

import AutoLaunch from 'auto-launch';
import { app, BrowserWindow, ipcMain } from 'electron';
import { startServer, stopServer } from './lib/server';
import { createTray, removeTray } from './lib/tray-menu';
import { createWelcomeWindow } from './lib/window-manager';
import path from 'path';
import { machineIdSync } from 'node-machine-id';
import { db } from '../shared/db';
import { DeviceUser, Prisma } from '@prisma/client';
import { setActivityMonitoring, stopActivityMonitoring } from './lib/activity-monitor';
import { setPowerMonitor, stopPowerMonitoring } from './lib/power-monitor';
import { WindowManager } from './lib';
import * as IPCHandlers from './handlers';
import is from 'electron-is';

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

let previousUserId: string | null = null;

/**
 * Handles the scenario when there's no active user.
 * Stops various services and shows the main window.
 * @param {string} devId - The device ID.
 */
function handleNoActiveUser(devId: string) {
  if (!previousUserId || previousUserId != devId) {

    // stopServer();
    // stopActivityMonitoring();
    // stopPowerMonitoring();

    removeTray();
    console.log('No active user');
    WindowManager.get(WindowManager.WINDOW_CONFIGS.main_window.id)
    previousUserId = devId;
  }
}

/**
 * Handles the scenario when there's an active user.
 * Starts various services and shows the welcome window.
 * @param {DeviceUser} user - The active user.
 */
function handleActiveUser(user: DeviceUser) {
  if (!previousUserId || previousUserId != user.id) {

    console.log('Active user');
    // startServer();
    // setPowerMonitor();
    // setActivityMonitoring();
    createTray(path.join(__dirname, 'img/tray-icon.ico'));
    createWelcomeWindow(user.firstName, user.lastName);

    WindowManager.get(WindowManager.WINDOW_CONFIGS.main_window.id).close()

    previousUserId = user.id;
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
              handleActiveUser(user);
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

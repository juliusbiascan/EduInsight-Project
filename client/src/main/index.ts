/**
 * @file index.ts
 * @description Main entry point for the EduInsight Client application.
 * This file sets up the Electron app, handles window management, user sessions,
 * socket connections, screen sharing, remote control, and various system events.
 */

import AutoLaunch from 'auto-launch';
import { app, BrowserWindow, desktopCapturer, ipcMain, screen } from 'electron';
import { createTray, removeTray } from './lib/tray-menu';
import path from 'path';
import { WindowManager } from './lib';
import * as IPCHandlers from './handlers';
import is from 'electron-is';
import { createSocketConnection, getSocketInstance, isSocketConnected } from './lib/socket-manager';
import { Socket } from 'socket.io-client';
import * as robot from "@jitsi/robotjs";
import { IPCRoute } from '@/shared/constants';
import StoreManager from '@/main/lib/store';
import Store from 'electron-store';

const store = StoreManager.getInstance();

/**
 * Handles the 'ready' event of the app.
 * Sets up IPC handlers, initializes the renderer store, creates a socket connection,
 * and sets up socket event listeners if not already connected.
 */
function handleOnReady() {
  // register all ipc handlers before creating the app window
  Object.values(IPCHandlers).forEach((handler) => handler());

  // initialize the renderer store
  Store.initRenderer();

  WindowManager.get(WindowManager.WINDOW_CONFIGS.setup_window.id)

  ipcMain.on(IPCRoute.DEVICE_INITIATED, e => {
    console.log("Device initiated");
    // Create socket connection using the Singleton
    createSocketConnection();

    // Get the socket instance
    const socket = getSocketInstance();

    // Only set up socket event listeners if the socket is not already connected
    if (!isSocketConnected()) {
      const deviceId = store.get('deviceId') as string;
      setupSocketEventListeners(socket, deviceId);
    }
  })
}

/**
 * Handles the scenario when no device is found in the database.
 * Opens the splash window to guide the user through device registration.
 */

function handleNoDeviceFound() {
  WindowManager.get(WindowManager.WINDOW_CONFIGS.splash_window.id);
}

/**
 * Handles unexpected errors in the application.
 * Logs the error and could potentially show an error window to the user.
 * @param {any} error - The error that occurred.
 */
function handleSomethingWentWrong(error: any) {
  console.log('Something went wrong', error);
}

/**
 * Handles the scenario when the server is down or unreachable.
 * Logs the issue and could potentially show a "Server Down" window to the user.
 */

function handleServerDown() {
  console.log('Server is down');
}

/**
 * Handles the scenario when there's an active user logged in.
 * Sets the user ID in the store, creates the system tray icon,
 * shows the welcome window, and closes the main window.
 * @param {string} userId - The ID of the active user.
 */
function handleActiveUser(userId: string) {
  store.set('userId', userId);
  createTray(path.join(__dirname, 'img/tray-icon.ico'));
  WindowManager.get(WindowManager.WINDOW_CONFIGS.welcome_window.id)
  WindowManager.get(WindowManager.WINDOW_CONFIGS.main_window.id).close()
}

/**
 * Handles the scenario when there's no active user (user logged out).
 * Removes the system tray icon, clears the user ID from the store,
 * and shows the main login window.
 */
function handleNoActiveUser() {
  removeTray();
  store.set('userId', null);
  WindowManager.get(WindowManager.WINDOW_CONFIGS.main_window.id)
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

  app.on('ready', handleOnReady);

  app.on('window-all-closed', async () => {
    if (!store.get("deviceId")) {
      handleAllClosed();
    }
  });

  app.on('activate', handleOnActivate);
})();

let captureInterval: NodeJS.Timeout | null = null;

function startScreenCapture(ws: Socket, deviceId: string) {
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
    const deviceId = store.get('deviceId') as string;
    if (deviceId) {
      socket.emit('join-server', deviceId);
      if (store.get('userId')) {
        handleActiveUser(store.get('userId') as string);
      } else {
        handleNoActiveUser();
      }
    } else {
      handleNoDeviceFound();
    }
  });

  socket.on('login-user', (userId: string) => {
    handleActiveUser(userId);
  });

  socket.on('logout-user', () => {
    handleNoActiveUser();
  });

  socket.on('start_sharing', () => {
    console.log("Starting screen sharing for device:", deviceId);
    startScreenCapture(socket, deviceId);
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
    handleSomethingWentWrong(error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
  });

  socket.on('connect-error', (error: any) => {
    handleSomethingWentWrong(error);
  });

  socket.on('connect-timeout', (error: any) => {
    handleServerDown();
  });
}

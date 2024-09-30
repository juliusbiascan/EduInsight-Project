/**
 * Generic IPC handlers.
 *
 * @module
 */
import is from 'electron-is';
import AppInfo from 'package.json';
import { app, ipcMain } from 'electron';
import { IPCRoute } from '../../shared/constants';

export { default as IPCWIndowHandler } from './window';
export { default as IPCUpdaterHandler } from './updater';
export { default as IPCDeviceHandler } from './device';
export { default as IPCDatabaseHandler } from './database';
/**
 * Register the IPC event handlers.
 *
 * @function
 */
export function IPCGenericHandler() {
  ipcMain.handle(IPCRoute.APP_INFO, () =>
    Promise.resolve({
      name: is.production() ? app.getName() : AppInfo.productName,
      version: is.production() ? app.getVersion() : AppInfo.version,
    })
  );
}
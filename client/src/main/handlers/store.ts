import { ipcMain } from 'electron';
import { IPCRoute } from '@/shared/constants';
import Store from 'electron-store';

const store = new Store();

export default function () {

  ipcMain.handle(IPCRoute.STORE_GET, (_, key: string) => {
    return store.get(key);
  });

  ipcMain.handle(IPCRoute.STORE_SET, (_, key: string, value: any) => {
    store.set(key, value);
    return true;
  });

  ipcMain.handle(IPCRoute.STORE_DELETE, (_, key: string) => {
    store.delete(key);
    return true;
  });

  ipcMain.handle(IPCRoute.STORE_CLEAR, () => {
    store.clear();
    return true;
  });

  ipcMain.handle(IPCRoute.STORE_HAS, (_, key: string) => {
    return store.has(key);
  });
}
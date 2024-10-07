import Store from 'electron-store';

class StoreManager {
  private static instance: Store;

  private constructor() { }

  public static getInstance(): Store {
    if (!StoreManager.instance) {
      StoreManager.instance = new Store();
    }
    return StoreManager.instance;
  }
}

export default StoreManager;
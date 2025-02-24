import { openDB } from 'idb';

class IndexedDBService {
  constructor(dbName = 'hls-downloader', storeName = 'video', dbVersion = 1) {
    if (!IndexedDBService.instance) {
      this.db = null;
      this.dbName = dbName;
      this.storeName = storeName;
      this.dbVersion = dbVersion;
      IndexedDBService.instance = this; // Lưu instance vào static property
    }
    return IndexedDBService.instance;
  }

  async init() {
    try {
      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade: (db) => {
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        },
      });
      console.log('IndexedDB initialized');
    } catch (error) {
      console.error('Error opening IndexedDB:', error);
    }
  }

  async save(key, data) {
    if (!this.db) {
      console.warn('Database is not initialized');
      return;
    }
    try {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      await store.put(data, key);
      await tx.done;
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  }

  async delete(key) {
    if (!this.db) {
      console.warn('Database is not initialized');
      return;
    }
    try {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      await store.delete(key);
      await tx.done;
    } catch (error) {
      console.error('Error deleting from IndexedDB:', error);
    }
  }

  async get(key) {
    if (!this.db) {
      console.warn('Database is not initialized');
      return null;
    }
    try {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      return await store.get(key);
    } catch (error) {
      console.error('Error getting data from IndexedDB:', error);
      return null;
    }
  }
}

const indexDBService = new IndexedDBService();
indexDBService.init();

export default indexDBService;

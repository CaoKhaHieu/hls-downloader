import { openDB } from 'idb';
import { VideoDownload } from '../../index.d';

class IndexedDBService {
  private static instance: IndexedDBService;
  private db: any;
  private dbName: string = 'hls-downloader';
  private storeName: string = 'video';
  private dbVersion: number = 1;

  constructor() {
    if (IndexedDBService.instance) {
      return IndexedDBService.instance;
    }

    IndexedDBService.instance = this;
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

  async save(key: string, data: VideoDownload) {
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

  async delete(key: string) {
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

  async get(key: string) {
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

  async getAll() {
    if (!this.db) {
      console.warn('Database is not initialized');
      return null;
    }
    try {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);

      const videos: VideoDownload[] = await store.getAll();
      return videos;
    } catch (error) {
      console.error('Error getting data from IndexedDB:', error);
      return null;
    }
  }

  async deleteAll() {
    if (!this.db) {
      console.warn('Database is not initialized');
      return null;
    }
    let cursor = await this.db.transaction(this.storeName, 'readwrite').store.openCursor();
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }
}

export default IndexedDBService;

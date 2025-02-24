import IndexedDBService from './IndexedDBService.js';
import DownloadManager from './DownloadManager.js';

class HLSDownloader {
  constructor({ url }) {
    this.url = url;
    this.dbService = new IndexedDBService();
    this.downloadManager = new DownloadManager();

    this.init();
  }

  async init() {
    await this.dbService.init();
    console.log('HLSDownloader initialized with IndexedDB');
  }

  // start download
  start() {
    console.log(`Start downloading: ${this.url}`);
    this.downloadManager.start(this.url);
  }

  // pause download
  pause() {
    console.log(`Pause downloading: ${this.url}`);
    this.downloadManager.pause(this.url);
  }

  // resume download
  resume() {
    console.log(`Resume downloading: ${this.url}`);
    this.downloadManager.resume(this.url);
  }

  // cancel download
  cancel() {
    console.log(`Cancel downloading: ${this.url}`);
    this.downloadManager.cancel(this.url);
  }
}

export default HLSDownloader;

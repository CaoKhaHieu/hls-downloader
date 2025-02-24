import DownloadManager from "./download-manager.js";
import indexedDBService from "./indexeddb-service.js";

class HLSDownloader {
  constructor({ url, idVideoIDB }) {
    this.url = url;
    this.idVideoIDB = idVideoIDB;
    this.downloadManager = new DownloadManager();
    this.initPromise = this.init();
  }

  async init() {
    await indexedDBService.init();
    console.log("HLSDownloader initialized");
  }

  // ensure init promise is resolved before start download
  async ensureInit() {
    await this.initPromise;
  }

  // start download
  async start() {
    console.log(`Start downloading: ${this.url}`);
    await this.ensureInit();
    this.downloadManager.start(this.url, this.idVideoIDB);
  }

  // pause download
  async pause() {
    console.log(`Pause downloading`);
    await this.ensureInit();
    this.downloadManager.pause(this.idVideoIDB);
  }

  // resume download
  async resume() {
    console.log(`Resume downloading`);
    await this.ensureInit();
    this.downloadManager.resume(this.idVideoIDB);
  }

  // cancel download
  async cancel() {
    await this.ensureInit();
    console.log(`Cancel downloading`);
    this.downloadManager.cancel(this.idVideoIDB);
  }

  // get video
  async getVideo(idVideoIDB) {
    await this.ensureInit();
    return await this.downloadManager.getVideo(idVideoIDB);
  }
}

export default HLSDownloader;

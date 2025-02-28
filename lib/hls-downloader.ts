import DownloadService from "./services/download-service";
import IndexedDBService from "./services/indexeddb-service";
import { HLSDownloadCallback, HLSOnProgressCallback, HLSDownloaderOptions } from "../index.d";

class HLSDownloader {
  private url: string;
  private idVideoIDB: string;
  private thumbnail: string;
  private metadata: any;
  private downloadService: any;
  private indexedDBService: IndexedDBService;

  private onSuccess: HLSDownloadCallback;
  private onProgress: HLSOnProgressCallback;
  private onPause: HLSDownloadCallback;
  private onResume: HLSDownloadCallback;
  private onCancel: HLSDownloadCallback;

  constructor(options: HLSDownloaderOptions) {
    this.url = options.url;
    this.idVideoIDB = options.idVideoIDB;
    this.thumbnail = options.thumbnail || '';
    this.metadata = options.metadata;
    this.onSuccess = options.onSuccess || (() => {});
    this.onProgress = options.onProgress || (() => {});
    this.onPause = options.onPause || (() => {});
    this.onResume = options.onResume || (() => {});
    this.onCancel = options.onCancel || (() => {});

    this.downloadService = new DownloadService();
    this.indexedDBService = new IndexedDBService();
  }

  async initIndexedDB() {
    await this.indexedDBService.init();
  }

  // start download
  async start() {
    console.log('Start downloading');
    await this.downloadService.start(
      this.url,
      this.idVideoIDB,
      this.thumbnail,
      this.metadata,
      this.onProgress,
      this.onSuccess,
    );
  }

  // pause download
  async pause() {
    console.log('Pause downloading');
    await this.downloadService.pause(this.idVideoIDB);
    if (this.onPause) {
      this.onPause();
    }
  }

  // resume download
  async resume() {
    console.log('Resume downloading');
    if (this.onResume) {
      this.onResume();
    }
    await this.downloadService.resume(this.idVideoIDB);
  }

  // cancel download
  async cancel() {
    console.log('Cancel downloading');
    await this.downloadService.cancel(this.idVideoIDB);
    if (this.onCancel) {
      this.onCancel();
    }
  }
}

export default HLSDownloader;

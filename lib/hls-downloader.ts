import DownloadService from "./services/download-service";
import IndexedDBService from "./services/indexeddb-service";
import { HLSDownloaderCallback, HLSDownloaderOptions } from "../index.d";

class HLSDownloader {
  private downloadService: DownloadService;
  private indexedDBService: IndexedDBService;
  private onProgress: (idVideoIDB: string, progress: number) => void;
  private onSuccess: (idVideoIDB: string) => void;
  private onError: (error: Error) => void;

  constructor({
    onProgress,
    onSuccess,
    onError,
  }: HLSDownloaderCallback) {
    this.onProgress = onProgress;
    this.onSuccess = onSuccess;
    this.onError = onError;
    this.downloadService = new DownloadService({
      onProgress: this.onProgress,
      onSuccess: this.onSuccess,
      onError: this.onError,
    });
    this.indexedDBService = new IndexedDBService();
  }

  async initIndexedDB() {
    await this.indexedDBService.init();
  }

  // start download
  async start(options: HLSDownloaderOptions) {
    console.log('Start downloading');
    await this.downloadService.start(options);
  }

  // pause download
  async pause(idVideoIDB: string) {
    console.log('Pause downloading');
    await this.downloadService.pause(idVideoIDB);
  }

  // resume download
  async resume(idVideoIDB: string) {
    console.log('Resume downloading');
    await this.downloadService.resume(idVideoIDB);
  }

  // cancel download
  async cancel(idVideoIDB: string) {
    console.log('Cancel downloading');
    await this.downloadService.cancel(idVideoIDB);
  }
}

export default HLSDownloader;

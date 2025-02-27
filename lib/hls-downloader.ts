import DownloadManager from "./download-manager";
import IndexedDBService from "./indexeddb-service";
import { HLSDownloadCallback, HLSOnProgressCallback, HLSDownloaderOptions } from "./hls-downloader.d";

class HLSDownloader {
  private url: string;
  private idVideoIDB: string;
  private thumbnail: string;
  private metadata: any;
  private downloadManager: any;
  private initPromise: Promise<void>;
  private indexedDBService: IndexedDBService;

  private onSuccess: HLSDownloadCallback;
  private onProgress: HLSOnProgressCallback;
  private onPause: HLSDownloadCallback;
  private onResume: HLSDownloadCallback;
  private onCancel: HLSDownloadCallback;
  private onDelete: HLSDownloadCallback;
  private onDeleteAll: HLSDownloadCallback;

  constructor(options: HLSDownloaderOptions) {
    this.url = options.url;
    this.idVideoIDB = options.idVideoIDB;
    this.thumbnail = options.thumbnail;
    this.metadata = options.metadata;
    this.onSuccess = options.onSuccess;
    this.onProgress = options.onProgress;
    this.onPause = options.onPause;
    this.onResume = options.onResume;
    this.onCancel = options.onCancel;
    this.onDelete = options.onDelete;
    this.onDeleteAll = options.onDeleteAll;

    this.downloadManager = new DownloadManager();
    this.indexedDBService = new IndexedDBService();
    this.initPromise = this.init();
  }

  async init() {
    await this.indexedDBService.init();
  }

  // ensure init promise is resolved before start download
  async ensureInit() {
    await this.initPromise;
  }

  // start download
  async start() {
    console.log('Start downloading');
    await this.ensureInit();
    await this.downloadManager.start(
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
    await this.ensureInit();
    await this.downloadManager.pause(this.idVideoIDB);
    if (this.onPause) {
      this.onPause();
    }
  }

  // resume download
  async resume() {
    console.log('Resume downloading');
    await this.ensureInit();
    await this.downloadManager.resume(this.idVideoIDB);
    if (this.onResume) {
      this.onResume();
    }
  }

  // cancel download
  async cancel() {
    await this.ensureInit();
    console.log('Cancel downloading');
    await this.downloadManager.cancel(this.idVideoIDB);
    if (this.onCancel) {
      this.onCancel();
    }
  }

  async deleteVideo(idVideoIDB: string) {
    await this.ensureInit();
    await this.downloadManager.deleteVideo(idVideoIDB);
    if (this.onDelete) {
      this.onDelete();
    }
  }

  // get video
  async getVideo(idVideoIDB: string) {
    await this.ensureInit();
    return await this.downloadManager.getVideo(idVideoIDB);
  }

  // get thumbnail video downloaded
  async getThumbnailVideoDownloaded(idVideoIDB: string) {
    await this.ensureInit();
    return await this.downloadManager.getThumbnailVideoDownloaded(idVideoIDB);
  }

  // get all videos
  async getAllVideos() {
    await this.ensureInit();
    return await this.downloadManager.getAllVideos();
  }

  // delete all videos
  async deleteAllVideos() {
    await this.ensureInit();
    await this.downloadManager.deleteAllVideos();
    if (this.onDeleteAll) {
      this.onDeleteAll();
    }
  }
}

export default HLSDownloader;

import DownloadManager from "./download-manager.js";
import IndexedDBService from "./indexeddb-service";

class HLSDownloader {
  private url: string;
  private idVideoIDB: string;
  private thumbnail: string;
  private metadata: any;
  private downloadManager: any;
  private initPromise: Promise<void>;
  private onSuccess: (data: any) => void;
  private onProgress: (data: any) => void;
  private onPause: (data: any) => void;
  private onResume: (data: any) => void;
  private onCancel: (data: any) => void;
  private onDelete: (data: any) => void;
  private onDeleteAll: () => void;

  constructor({
    url,
    idVideoIDB,
    thumbnail,
    metadata,
    onSuccess,
    onProgress,
    onPause,
    onResume,
    onCancel,
    onDelete,
    onDeleteAll
  }: {
    url: string;
    idVideoIDB: string;
    thumbnail: string;
    metadata: any;
    onSuccess: (data: any) => void;
    onProgress: (data: any) => void;
    onPause: (data: any) => void;
    onResume: (data: any) => void;
    onCancel: (data: any) => void;
    onDelete: (data: any) => void;
    onDeleteAll: () => void;
  }) {
    this.url = url;
    this.idVideoIDB = idVideoIDB;
    this.thumbnail = thumbnail;
    this.metadata = metadata;

    this.onSuccess = onSuccess;
    this.onProgress = onProgress;
    this.onPause = onPause;
    this.onResume = onResume;
    this.onCancel = onCancel;
    this.onDelete = onDelete;
    this.onDeleteAll = onDeleteAll;

    this.downloadManager = new DownloadManager();
    this.initPromise = this.init();
  }

  async init() {
    await IndexedDBService.init();
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
    await this.downloadManager.start(
      this.url,
      this.idVideoIDB,
      this.thumbnail,
      this.metadata,
      this.onProgress,
      this.onDeleteAll,
    );
    if (this.onSuccess) {
      this.onSuccess({ id: this.idVideoIDB });
    }
  }

  // pause download
  async pause() {
    console.log(`Pause downloading`);
    await this.ensureInit();
    await this.downloadManager.pause(this.idVideoIDB);
    if (this.onPause) {
      this.onPause({ id: this.idVideoIDB });
    }
  }

  // resume download
  async resume() {
    console.log(`Resume downloading`);
    await this.ensureInit();
    await this.downloadManager.resume(this.idVideoIDB);
    if (this.onResume) {
      this.onResume({ id: this.idVideoIDB });
    }
  }

  // cancel download
  async cancel() {
    await this.ensureInit();
    console.log(`Cancel downloading`);
    await this.downloadManager.cancel(this.idVideoIDB);
    if (this.onCancel) {
      this.onCancel({ id: this.idVideoIDB });
    }
  }

  async deleteVideo(idVideoIDB: string) {
    await this.ensureInit();
    console.log(`Delete video`);
    await this.downloadManager.deleteVideo(idVideoIDB);
    if (this.onDelete) {
      this.onDelete({ id: this.idVideoIDB });
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

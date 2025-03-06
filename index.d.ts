export type HLSDownloadCallback = (data: any) => void;

export interface VideoDownload {
  url: string;
  isPaused: boolean;
  arr: Uint8Array<ArrayBuffer>[];
  totalSegments: number;
  metadata: any;
  thumbnail: string | Uint8Array<ArrayBuffer>;
  segments: string[];
}

export interface HLSDownloaderOptions {
  url: string;
  idVideoIDB: string;
  thumbnail?: string;
  metadata?: any;
}

export interface HLSDownloaderCallback {
  onProgress: (idVideoIDB: string, progress: number) => void;
  onSuccess: (idVideoIDB: string) => void;
  onError: (error: Error) => void;
}

export interface IHLSDownloader {
  initIndexedDB: () => Promise<void>;
  start: (options: HLSDownloaderOptions) => Promise<void>;
  pause: (idVideoIDB: string) => Promise<void>;
  resume: (idVideoIDB: string) => Promise<void>;
  cancel: (idVideoIDB: string) => Promise<void>;
}

// Class constructor type
export declare class HLSDownloader implements IHLSDownloader {
  constructor(callbacks: HLSDownloaderCallback);
  initIndexedDB(): Promise<void>;
  start(options: HLSDownloaderOptions): Promise<void>;
  pause(idVideoIDB: string): Promise<void>;
  resume(idVideoIDB: string): Promise<void>;
  cancel(idVideoIDB: string): Promise<void>;
}

export interface IHLSManager {
  deleteVideo: (idVideoIDB: string) => Promise<void>;
  getVideo: (idVideoIDB: string) => Promise<VideoDownload>;
  getThumbnailVideoDownloaded: (idVideoIDB: string) => Promise<string | null>;
  getAllVideos: () => Promise<VideoDownload[]>;
  getAllVideosDownloaded: () => Promise<VideoDownload[]>;
  getAllVideosDownloading: () => Promise<VideoDownload[]>;
  deleteAllVideos: () => Promise<void>;
}

export declare class HLSManager implements IHLSManager {
  constructor();
  deleteVideo(idVideoIDB: string): Promise<void>;
  getVideo(idVideoIDB: string): Promise<VideoDownload>;
  getThumbnailVideoDownloaded(idVideoIDB: string): Promise<string | null>;
  getAllVideos(): Promise<VideoDownload[]>;
  getAllVideosDownloaded(): Promise<VideoDownload[]>;
  getAllVideosDownloading(): Promise<VideoDownload[]>;
  deleteAllVideos(): Promise<void>;
}

type HLSDownloadCallback = (data: any) => void;

// Interface cho video download
interface VideoDownload {
  url: string;
  isPaused: boolean;
  arr: Uint8Array<ArrayBuffer>[];
  totalSegments: number;
  metadata: any;
  thumbnail: string | Uint8Array<ArrayBuffer>;
  segments: string[];
}

// Interface cho constructor parameters of HLSDownloader
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

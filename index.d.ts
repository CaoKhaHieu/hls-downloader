type HLSDownloadCallback = () => void;
type HLSOnProgressCallback = (data: any) => void;

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
  onSuccess?: HLSDownloadCallback;
  onProgress?: HLSOnProgressCallback;
  onPause?: HLSDownloadCallback;
  onResume?: HLSDownloadCallback;
  onCancel?: HLSDownloadCallback;
}


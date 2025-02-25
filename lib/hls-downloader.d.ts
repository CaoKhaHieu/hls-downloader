type HLSDownloadCallback = () => void;
type HLSOnProgressCallback = (data: any) => void;

// Interface cho constructor parameters
export interface HLSDownloaderOptions {
  url: string;
  idVideoIDB: string;
  thumbnail: string;
  metadata: any;
  onSuccess: HLSDownloadCallback;
  onProgress: HLSOnProgressCallback;
  onPause: HLSDownloadCallback;
  onResume: HLSDownloadCallback;
  onCancel: HLSDownloadCallback;
  onDelete: HLSDownloadCallback;
  onDeleteAll: HLSDownloadCallback;
}

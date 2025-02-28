# A Library for download HLS Stream and play video HLS in offline mode on browser

## Install
```bash
npm install hls-downloader
```

## Usage
- Download HLS Stream
```ts
import { HLSDownloader } from 'hls-downloader';

const hlsDownloader = new HLSDownloader({
  url: 'https://example.com/hls.m3u8',
});
hlsDownloader.initIndexedDB().then(() => {
  // start download
  hlsDownloader.start();

  // pause download
  hlsDownloader.pause();

  // resume download
  hlsDownloader.resume();

  // cancel download
  hlsDownloader.cancel();
});
```

- Manage HLS Video in IndexedDB
```ts
import { HLSManager } from 'hls-downloader';

const hlsManager = new HLSManager();

// get all videos 
hlsManager.getAllVideos();

// get videos downloaded
hlsManager.getAllVideosDownloaded();  

// get videos downloading
hlsManager.getAllVideosDownloading();

// delete all videos
hlsManager.deleteAllVideos();

// delete video
hlsManager.deleteVideo(idVideoIDB: string);

// get video
hlsManager.getVideo(idVideoIDB: string);

// get thumbnail video downloaded
hlsManager.getThumbnailVideoDownloaded(idVideoIDB: string);

```

## Parameters of HLSDownloader
```ts
export interface HLSDownloaderOptions {
  url: string; // url of hls stream
  idVideoIDB: string; // id of video in indexedDB
  thumbnail?: string; // thumbnail of video
  metadata?: any; // metadata of video
  onSuccess?: HLSDownloadCallback; // callback when download success
  onProgress?: HLSOnProgressCallback; // callback when download progress
  onPause?: HLSDownloadCallback; // callback when download pause
  onResume?: HLSDownloadCallback; // callback when download resume
  onCancel?: HLSDownloadCallback; // callback when download cancel
}
```

## Local Development

- Install dependencies and run example
```bash
npm install
npm run dev
```
- Build library
```bash
npm run build
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
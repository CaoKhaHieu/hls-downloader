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
  onProgress: (idVideoIDB, progress) => {
    console.log('onProgress', idVideoIDB, progress);
  },
  onSuccess: (idVideoIDB) => {
    console.log('onSuccess', idVideoIDB);
  },
  onError: (error) => {
    console.log('onError', error);
  }
});
hlsDownloader.initIndexedDB().then(() => {
  // start download
  hlsDownloader.start({
    url: 'https://example.com/hls.m3u8', // url of hls stream
    idVideoIDB: '1', // id of video in indexedDB
    thumbnail: 'https://picsum.photos/536/354', // thumbnail of video
    metadata: { // metadata of video
      title: 'The Lorem Ipsum for photos.'
      description: 'The Lorem Ipsum for photos.',
    }
  });
  hlsDownloader.pause('1');

  // resume download
  hlsDownloader.resume('1');

  // cancel download
  hlsDownloader.cancel('1');
});
```

- Manage HLS Video in IndexedDB
```ts
import { HLSManager } from 'hls-downloader';

const hlsManager = new HLSManager();

// get all videos 
hlsManager.getAllVideos().then((data) => {
  console.log('data', data);
});

// get videos downloaded
hlsManager.getAllVideosDownloaded().then((data) => {
  console.log('data', data);
});

// get videos downloading
hlsManager.getAllVideosDownloading().then((data) => {
  console.log('data', data);
});

// delete all videos
hlsManager.deleteAllVideos().then((data) => {
  console.log('data', data);
});

// delete video
hlsManager.deleteVideo(idVideoIDB: string).then((data) => {
  console.log('data', data);
});

// get video
hlsManager.getVideo(idVideoIDB: string).then((data) => {
  console.log('data', data);
});

// get thumbnail video downloaded
hlsManager.getThumbnailVideoDownloaded(idVideoIDB: string).then((data) => {
  console.log('data', data);
});
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
import { HLSDownloader, HLSManager } from '../lib/index';
import muxjs from 'mux.js';

const mergeListArrayBuffer = (myArrays: Uint8Array[]) => {
  let length = 0;
  myArrays.forEach(item => {
    length += item.length;
  });
  const mergedArray = new Uint8Array(length);
  let offset = 0;
  myArrays.forEach(item => {
    mergedArray.set(item, offset);
    offset += item.length;
  });

  return mergedArray;
};

(async () => {
  const urls = [
    "https://vod02.cdn.web.tv/ps/fp/psfpskkrfpm_,240,360,.mp4.urlset/master.m3u8",
    "https://vod.ottclouds.com/vods/9999/CcRxJOQgiwAFdpmYc7oezZM4Tvah7Lmp4/playlist.m3u8"
  ];

  const downloader = new HLSDownloader({
    onProgress: (idVideoIDB: string, progress: number) => {
      console.log('onProgress', idVideoIDB, progress);
    }
  });
  const hlsManager = new HLSManager();
  await downloader.initIndexedDB();

  const startButton = document.getElementById('start');
  const startButton2 = document.getElementById('start2');
  const pauseButton = document.getElementById('pause');
  const resumeButton = document.getElementById('resume');
  const cancelButton = document.getElementById('cancel');
  const deleteButton = document.getElementById('delete');
  const deleteAllButton = document.getElementById('delete-all');

  if (!startButton || !startButton2 || !pauseButton || !resumeButton || !cancelButton || 
      !deleteButton || !deleteAllButton) {
    console.error('Required DOM elements not found');
    return;
  }

  // add event listener to start download
  startButton.addEventListener('click', () => {
    downloader.start({
      url: urls[0],
      idVideoIDB: '1',
      thumbnail: 'https://picsum.photos/536/354',
      metadata: {
        title: 'The Lorem Ipsum for photos.', 
        description: 'The Lorem Ipsum for photos.',
      },
      onSuccess: (data) => {
        console.log('onSuccess', data);
      },
      onError: () => {
        console.log('onError');
      },
    });
  });
  startButton2.addEventListener('click', () => {
    downloader.start({
      url: urls[1],
      idVideoIDB: '2',
      thumbnail: 'https://picsum.photos/536/354',
      metadata: {
        title: 'The Lorem Ipsum for photos.', 
        description: 'The Lorem Ipsum for photos.',
      },
      onSuccess: (data) => {
        console.log('onSuccess', data);
      },
      onError: () => {
        console.log('onError');
      },
    });
  });
  pauseButton.addEventListener('click', () => downloader.pause('2'));
  resumeButton.addEventListener('click', () => downloader.resume('2'));
  cancelButton.addEventListener('click', () => downloader.cancel('2'));
  deleteButton.addEventListener('click', () => hlsManager.deleteVideo('2'));
  deleteAllButton.addEventListener('click', () => hlsManager.deleteAllVideos());

  // get videos
  const video = await hlsManager.getVideo('2');
  const videos = await hlsManager.getAllVideos();
  console.log({ video, videos })
  if (!video) {
    return;
  }

  // play video offline mode
  const mediaSource = new MediaSource();
  const transmuxer = new muxjs.mp4.Transmuxer();
  const mime = 'video/mp4; codecs="mp4a.40.2,avc1.64001f"';

  const mergedArray = mergeListArrayBuffer([...video.arr]);

  const videoElement = document.querySelector('video') as HTMLVideoElement;
  videoElement.src = URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', () => appendSegments(mergedArray));

  const appendSegments = (data: Uint8Array) => {
    URL.revokeObjectURL(videoElement.src);
    const sourceBuffer = mediaSource.addSourceBuffer(mime);
    sourceBuffer.addEventListener('updateend', () => {
      mediaSource.endOfStream();
    });
    transmuxer.on('data', (segment: any) => {
      const data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
      data.set(segment.initSegment, 0);
      data.set(segment.data, segment.initSegment.byteLength);
      sourceBuffer.appendBuffer(data);
      transmuxer.off('data');
    });
    transmuxer.push(new Uint8Array(data));
    transmuxer.flush();
  };

  // test get thumbnail video downloaded and preview
  const thumbnailElement = document.querySelector('.thumbnail') as HTMLImageElement;
  const thumbnail = await hlsManager.getThumbnailVideoDownloaded('1');
  if (thumbnail) {
    thumbnailElement.src = thumbnail;
  }
})();
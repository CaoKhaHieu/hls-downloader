import HLSDownloader from '../lib/hls-downloader';
import HLSManager from '../lib/hls-manager';
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
    "https://vod.ottclouds.com/vods/9999/1eSLicF5KckJbtcfbrXl_MEDIA_20250106-230139_1736204499007_bTABcQmp4/playlist.m3u8",
    "https://vtvgo-vods.vtvdigital.vn/RTJC-PMXuacVrExErCl_Tw/1740628543/vod/20250222/nong-trua-22t2.mp4/index.m3u8",
    "https://vtvgo-vods.vtvdigital.vn/of3wkYPedOwjEp6hK_77Sg/1740628756/vod/20250222/cd.mp4/index.m3u8",
    "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
    "https://vod.ottclouds.com/vods/9999/yErcTbh8ijsYaP9xk7Vf_MEDIA_20241213-000306_1734048186105_ZSuQC6mp4/playlist.m3u8",
  ];

  const downloader = new HLSDownloader({
    url: urls[0],
    idVideoIDB: '1',
    thumbnail: 'https://picsum.photos/536/354',
    metadata: {
      title: 'The Lorem Ipsum for photos.',
      description: 'The Lorem Ipsum for photos.',
      category: 'The Lorem Ipsum for photos.',
      tags: ['video', 'hls', 'download'],
    },
    onSuccess: () => {
      console.log('onSuccess');
    },
    onProgress: (data) => {
      console.log('onProgress', data);
    },
    onPause: () => {
      console.log('onPause');
    },
    onResume: () => {
      console.log('onResume');
    },
    onCancel: () => {
      console.log('onCancel');
    },
    onDelete: () => {
      console.log('onDelete');
    },
    onDeleteAll: () => {
      console.log('onDeleteAll');
    }
  });
  const hlsManager = new HLSManager();
  await downloader.initIndexedDB();

  const startButton = document.getElementById('start');
  const pauseButton = document.getElementById('pause');
  const resumeButton = document.getElementById('resume');
  const cancelButton = document.getElementById('cancel');
  const deleteButton = document.getElementById('delete');
  const deleteAllButton = document.getElementById('delete-all');

  if (!startButton || !pauseButton || !resumeButton || !cancelButton || 
      !deleteButton || !deleteAllButton) {
    console.error('Required DOM elements not found');
    return;
  }

  // add event listener to start download
  startButton.addEventListener('click', () => downloader.start());
  pauseButton.addEventListener('click', () => downloader.pause());
  resumeButton.addEventListener('click', () => downloader.resume());
  cancelButton.addEventListener('click', () => downloader.cancel());
  deleteButton.addEventListener('click', () => hlsManager.deleteVideo('1'));
  deleteAllButton.addEventListener('click', () => hlsManager.deleteAllVideos());

  // get videos
  const video = await hlsManager.getVideo('1');
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
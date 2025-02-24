import HLSDownloader from './lib/hls-downloader.js';
import muxjs from 'mux.js';

const mergeListArrayBuffer = (myArrays) => {
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
  const url = "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
  const url2 = "https://vod.ottclouds.com/vods/9999/CcRxJOQgiwAFdpmYc7oezZM4Tvah7Lmp4/playlist.m3u8"
  const downloader = new HLSDownloader({ url: url2, idVideoIDB: 1 });

  // start download
  document.getElementById('start').addEventListener('click', () => {
    downloader.start();
  });

  document.getElementById('pause').addEventListener('click', () => {
    downloader.pause();
  });

  document.getElementById('resume').addEventListener('click', () => {
    downloader.resume();
  });

  document.getElementById('cancel').addEventListener('click', () => {
    downloader.cancel();
  });

  // get video
  const video = await downloader.getVideo(1);
  if (!video) {
    return;
  }

  const mediaSource = new MediaSource();
  const transmuxer = new muxjs.mp4.Transmuxer();
  const mime = 'video/mp4; codecs="mp4a.40.2,avc1.64001f"';

  const mergedArray = mergeListArrayBuffer([...video.arr]);

  let videoElement = document.querySelector('video');
  videoElement.src = URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', () => appendSegments(mergedArray));

  const appendSegments = (data) => {
    URL.revokeObjectURL(videoElement.src);
    const sourceBuffer = mediaSource.addSourceBuffer(mime);
    sourceBuffer.addEventListener('updateend', () => {
      mediaSource.endOfStream();
    });
    transmuxer.on('data', (segment) => {
      const data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
      data.set(segment.initSegment, 0);
      data.set(segment.data, segment.initSegment.byteLength);
      sourceBuffer.appendBuffer(data);
      transmuxer.off('data');
    });
    transmuxer.push(new Uint8Array(data));
    transmuxer.flush();
  };
})();

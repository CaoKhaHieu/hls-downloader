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
  const url1 = "https://vtvgo-vods.vtvdigital.vn/RTJC-PMXuacVrExErCl_Tw/1740628543/vod/20250222/nong-trua-22t2.mp4/index.m3u8"
  const url2 = "https://vtvgo-vods.vtvdigital.vn/of3wkYPedOwjEp6hK_77Sg/1740628756/vod/20250222/cd.mp4/index.m3u8"
  const url3 = "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
  const url4 = "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8"

  const downloader = new HLSDownloader({
    url: url1,
    idVideoIDB: 1,
    thumbnail: 'https://picsum.photos/536/354',
    subtitle: 'https://picsum.photos/536/354',
    metadata: {
      title: 'The Lorem Ipsum for photos.',
      description: 'The Lorem Ipsum for photos.',
      category: 'The Lorem Ipsum for photos.',
      tags: ['video', 'hls', 'download'],
    },
    onSuccess: (data) => {
      console.log('onSuccess', data);
    },
    onProgress: (data) => {
      console.log('onProgress', data);
    },
    onPause: (data) => {
      console.log('onPause', data);
    },
    onResume: (data) => {
      console.log('onResume', data);
    },
    onCancel: (data) => {
      console.log('onCancel', data);
    },
    onDelete: (data) => {
      console.log('onDelete', data);
    },
    onDeleteAll: () => {
      console.log('onDeleteAll');
    }
  });
  const downloader2 = new HLSDownloader({
    url: url2,
    idVideoIDB: 2,
    thumbnail: 'https://picsum.photos/536/354',
    subtitle: 'https://picsum.photos/536/354',
    metadata: {
      title: 'The Lorem Ipsum for photos.',
      description: 'The Lorem Ipsum for photos.',
      category: 'The Lorem Ipsum for photos.',
      tags: ['video', 'hls', 'download'],
    },
    onSuccess: (data) => {
      console.log('onSuccess', data);
    },
    onProgress: (data) => {
      console.log('onProgress', data);
    },
    onPause: (data) => {
      console.log('onPause', data);
    },
    onResume: (data) => {
      console.log('onResume', data);
    },
    onCancel: (data) => {
      console.log('onCancel', data);
    },
    onDelete: (data) => {
      console.log('onDelete', data);
    }
  });

  // add event listener to start download
  document.getElementById('start').addEventListener('click', () => {
    downloader.start();
    downloader2.start();
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

  document.getElementById('delete').addEventListener('click', () => {
    downloader.deleteVideo(1);
  });

  document.getElementById('delete-all').addEventListener('click', () => {
    downloader.deleteAllVideos();
  });

  // get videos
  const video = await downloader.getVideo(1);
  const videos = await downloader.getAllVideos();
  if (!video) {
    return;
  }

  // play video offline mode
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

  // test get thumbnail video downloaded and preview
  const thumbnail = await downloader.getThumbnailVideoDownloaded(1);
  const thumbnailElement = document.querySelector('.thumbnail');
  thumbnailElement.src = thumbnail;
})();

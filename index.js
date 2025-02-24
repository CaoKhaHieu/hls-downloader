import HLSDownloader from './lib/HLSDownloader.js';

(async () => {
  const url = "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
  const url2 = "https://vod.ottclouds.com/vods/9999/CcRxJOQgiwAFdpmYc7oezZM4Tvah7Lmp4/playlist.m3u8"
  const downloader = new HLSDownloader({ url: url, idVideoIDB: 1 });
  console.log({ downloader })
  downloader.start();
})();

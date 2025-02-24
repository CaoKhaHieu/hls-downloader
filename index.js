import HLSDownloader from './lib/HLSDownloader.js';

(async () => {
  const downloader = new HLSDownloader({ url: "https://vod.ottclouds.com/vods/9999/CcRxJOQgiwAFdpmYc7oezZM4Tvah7Lmp4/playlist.m3u8" });
  console.log({ downloader })
  downloader.start();
})();

import DownloadManager from "./DownloadManager.js";

class HLSDownloader {
  constructor({ url, idVideoIDB }) {
    this.url = url;
    this.idVideoIDB = idVideoIDB;
    this.downloadManager = new DownloadManager();
  }

  // start download
  start() {
    console.log(`Start downloading: ${this.url}`);
    setTimeout(() => {
      this.downloadManager.start(this.url, this.idVideoIDB);
    }, 1000);
  }

  // pause download
  pause() {
    console.log(`Pause downloading: ${this.url}`);
    this.downloadManager.pause(this.url);
  }

  // resume download
  resume() {
    console.log(`Resume downloading: ${this.url}`);
    this.downloadManager.resume(this.url);
  }

  // cancel download
  cancel() {
    console.log(`Cancel downloading: ${this.url}`);
    this.downloadManager.cancel(this.url);
  }
}

export default HLSDownloader;

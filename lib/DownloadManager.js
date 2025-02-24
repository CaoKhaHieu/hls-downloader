import axios from "axios";
import { Parser } from "m3u8-parser";
import { MAX_VIDEOS_DOWNLOADING } from "./constants.js";
import indexedDBService from "./IndexedDBService.js";

class DownloadManager {
  constructor() {
    this.idVideoIDB = null;

    this.countDownload = 0;
    this.idCurrentVideo = null;
    this.progress = {};
    this.videosWaiting = [];
    this.infoVideoDownload = {};
  }

  updateCountDownload = (action) => {
    if (this.countDownload <= 0) {
      return;
    }
    if (action === "RESET") {
      this.countDownload = 0;
      return;
    }
    if (action === "INCREASE") {
      this.countDownload = this.countDownload + 1;
      return;
    }
    if (action === "DESCREASE") {
      this.countDownload = this.countDownload - 1;
      return;
    }
  };

  // get all segments from m3u8 url
  async fetchM3u8Url(urlVideo) {
    const position = urlVideo.indexOf(".m3u8");
    const baseURL = urlVideo.substring(0, urlVideo.lastIndexOf("/", position));

    const response = await axios.get(urlVideo);
    const playlistContent = response.data;

    const parser = new Parser();
    parser.push(playlistContent);
    parser.end();

    if (parser.manifest?.playlists?.length > 0) {
      const m3u8Endpoint = parser.manifest?.playlists[0]?.uri;
      const m3u8Url = `${baseURL}/${m3u8Endpoint}`;

      const position2 = m3u8Url.indexOf(".m3u8");
      const baseURL2 = m3u8Url.substring(
        0,
        m3u8Url.lastIndexOf("/", position2)
      );

      const response2 = await axios.get(m3u8Url);
      const parser2 = new Parser();
      parser2.push(response2.data);
      parser2.end();

      const fullUrls = parser2.manifest.segments.map((segment) => {
        const segmentUri = baseURL2 + "/" + segment.uri;
        return segmentUri;
      });
      return fullUrls;
    }

    if (parser.manifest.segments.length > 0) {
      const fullUrls = parser.manifest.segments.map((segment) => {
        const segmentUri = baseURL + "/" + segment.uri;
        return segmentUri;
      });
      return fullUrls;
    }
  }

  // create a promise fetch all segments from url
  async fetchSegments(tsUrls) {
    for (const url of tsUrls) {
      try {
        await this.fetchChunk(url);
      } catch (error) {
        throw error;
      }
    }
  }

  // fetch segment from url and return Uint8Array
  async fetchChunk(url) {
    // check if the user is offline or the video is paused or the number of videos being downloaded is greater than the maximum
    if (!navigator.onLine || !this.infoVideoDownload[this.idVideoIDB]) {
      return;
    }
    if (this.infoVideoDownload[this.idVideoIDB].isPaused) {
      return;
    }
    if (this.countDownload > MAX_VIDEOS_DOWNLOADING) {
      return;
    }

    // fetch segment from url
    const response = await (await fetch(url)).arrayBuffer();
    const chunkData = new Uint8Array(response);

    // save chunk data to info video download
    this.infoVideoDownload[this.idVideoIDB].arr.push(chunkData);
    await indexedDBService.save(this.idVideoIDB, this.infoVideoDownload);

    // update progress
    const currentProgress = Math.floor(
      (this.infoVideoDownload[this.idVideoIDB].arr.length /
        this.infoVideoDownload[this.idVideoIDB].totalSegments) *
        100
    );
    this.progress[this.idVideoIDB] = currentProgress;
    // setProgress((progress) => ({ ...progress, [idVideoIDB]: currentProgress }));
  }

  // start download
  async start(url, idVideoIDB) {
    // init info video download
    this.infoVideoDownload[idVideoIDB] = {
      url,
      isPaused: false,
      arr: [],
      totalSegments: 0,
    };
    this.idVideoIDB = idVideoIDB;

    // init progress
    this.progress[idVideoIDB] = {
      idVideoIDB: 0,
    };

    // save info video download to indexedDB
    await indexedDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);

    // check if the number of videos being downloaded is greater than the maximum
    if (this.countDownload >= MAX_VIDEOS_DOWNLOADING) {
      this.videosWaiting = [
        ...this.videosWaiting,
        this.infoVideoDownload[idVideoIDB],
      ];
      return;
    }
    this.updateCountDownload("INCREASE");

    const tsUrls = await this.fetchM3u8Url(url);

    this.infoVideoDownload[idVideoIDB].totalSegments = tsUrls.length;
    this.infoVideoDownload[idVideoIDB].segments = tsUrls;

    // save info video download to indexedDB
    await indexedDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);

    const data = await this.fetchSegments(tsUrls);
    console.log({ data });
  }

  // pause download
  async pause(url) {
    console.log(`Pause downloading: ${this.url}`);
    this.pause(this.url);
  }

  // resume download
  async resume(url) {
    console.log(`Resume downloading: ${this.url}`);
    this.resume(this.url);
  }

  // cancel download
  async cancel(url) {
    console.log(`Cancel downloading: ${this.url}`);
    this.cancel(this.url);
  }
}

export default DownloadManager;

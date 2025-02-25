import axios from "axios";
import { Parser } from "m3u8-parser";
import { MAX_VIDEOS_DOWNLOADING } from "./constants.js";
import indexedDBService from "./indexeddb-service.js";

class DownloadManager {
  constructor() {
    this.idVideoIDB = null;
    this.onProgress = () => {};

    this.countDownload = 0;
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

  // fetch thumbnail from url and return Uint8Array
  async fetchThumbnail(url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      return uint8Array;
    } catch (error) {
      return null;
    }
  }

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

    // update progress
    const currentProgress = Math.floor(
      (this.infoVideoDownload[this.idVideoIDB].arr.length /
        this.infoVideoDownload[this.idVideoIDB].totalSegments) *
        100
    );
    this.progress[this.idVideoIDB] = currentProgress;
    if (this.onProgress) {
      this.onProgress({ id: this.idVideoIDB, progress: currentProgress });
    }

    // if the progress is greater than 100, return
    if (currentProgress > 100) {
      return;
    }
    await indexedDBService.save(this.idVideoIDB, this.infoVideoDownload[this.idVideoIDB]);
    return;
  }

  // start download
  async start(url, idVideoIDB, thumbnail, metadata, onProgress = {}) {
    // init info video download
    this.infoVideoDownload[idVideoIDB] = {
      url,
      isPaused: false,
      arr: [],
      totalSegments: 0,
      thumbnail,
      metadata,
    };
    this.idVideoIDB = idVideoIDB;
    this.onProgress = onProgress;

    // init progress
    this.progress[idVideoIDB] = {
      idVideoIDB: 0,
    };

    // save thumbnail to indexedDB
    if (thumbnail) {
      const thumbnailUint8Array = await this.fetchThumbnail(thumbnail);
      this.infoVideoDownload[idVideoIDB].thumbnail = thumbnailUint8Array;
    }

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

    await this.fetchSegments(tsUrls);
  }

  // pause download
  async pause(idVideoIDB) {
    // if the number of segments downloaded is equal to the total number of segments, return
    if (this.infoVideoDownload[idVideoIDB].arr.length === this.infoVideoDownload[idVideoIDB].totalSegments) {
      return;
    }
    
    this.infoVideoDownload[idVideoIDB].isPaused = true;
    this.updateCountDownload('DESCREASE');
    await indexedDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);
  }

  // resume download
  async resume(idVideoIDB) {
    // if the number of segments downloaded is equal to the total number of segments, return
    if (this.infoVideoDownload[idVideoIDB].arr.length === this.infoVideoDownload[idVideoIDB].totalSegments) {
      return;
    }
    
    this.infoVideoDownload[idVideoIDB].isPaused = false;
    this.updateCountDownload('INCREASE');
    await this.fetchSegments(this.infoVideoDownload[idVideoIDB].segments);
  }

  // cancel download
  async cancel(idVideoIDB) {
    this.infoVideoDownload[idVideoIDB].isPaused = true;
    delete this.infoVideoDownload[idVideoIDB];
    this.updateCountDownload('DESCREASE');
    await indexedDBService.delete(idVideoIDB);
  }

  // delete video
  async deleteVideo(idVideoIDB) {
    await indexedDBService.delete(idVideoIDB);
  }

  // get video
  async getVideo(idVideoIDB) {
    return await indexedDBService.get(idVideoIDB);
  }

  // get thumbnail video downloaded
  async getThumbnailVideoDownloaded(idVideoIDB) {
    const video = await indexedDBService.get(idVideoIDB);
    if (!video?.thumbnail) {
      return null;
    }

    const thumbnailUrl = URL.createObjectURL(
      new Blob([video.thumbnail], { type: 'image/png' })
    );
    return thumbnailUrl;
  }

  // get all videos
  async getAllVideos() {
    return await indexedDBService.getAll();
  }

  // delete all videos
  async deleteAllVideos() {
    return await indexedDBService.deleteAll();
  }
}

export default DownloadManager;

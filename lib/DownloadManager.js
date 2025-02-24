import axios from "axios";
import { Parser } from "m3u8-parser";
import IndexedDBService from "./IndexedDBService.js";

class DownloadManager {
  constructor() {
    this.countDownload = 0;
    this.idCurrentVideo = null;
    this.progress = {};
    this.videosWaiting = [];
    this.infoVideoDownload = {};
    this.indexDBService = new IndexedDBService();
  }

  // get all segments from m3u8 url
  async fetchM3u8Url(urlVideo) {
    const position = urlVideo.indexOf('.m3u8');
    const baseURL = urlVideo.substring(0, urlVideo.lastIndexOf('/', position));

    const response = await axios.get(urlVideo);
    const playlistContent = response.data;

    const parser = new Parser();
    parser.push(playlistContent);
    parser.end();

    if (parser.manifest?.playlists?.length > 0) {
      const m3u8Endpoint = parser.manifest?.playlists[0]?.uri;
      const m3u8Url = `${baseURL}/${m3u8Endpoint}`;

      const position2 = m3u8Url.indexOf('.m3u8');
      const baseURL2 = m3u8Url.substring(0, m3u8Url.lastIndexOf('/', position2));

      const response2 = await axios.get(m3u8Url);
      const parser2 = new Parser();
      parser2.push(response2.data);
      parser2.end();

      const fullUrls = parser2.manifest.segments.map(segment => {
        const segmentUri = baseURL2 + '/' + segment.uri;
        return segmentUri;
      });
      return fullUrls;
    }

    if (parser.manifest.segments.length > 0) {
      const fullUrls = parser.manifest.segments.map(segment => {
        const segmentUri = baseURL + '/' + segment.uri;
        return segmentUri;
      });
      return fullUrls;
    }
  };

  // create a promise fetch all segments from url
  async fetchSegments (tsUrls) {
    const mappingFetchTs = tsUrls?.map((segment) => this.fetchChunk(segment));
    const data = await Promise.all(mappingFetchTs);
    return data;
  };

  // fetch segment from url and return Uint8Array
  async fetchChunk(url) {
    const response = await (await fetch(url)).arrayBuffer();
    return new Uint8Array(response);
  };

  // start download
  async start(url) {
    // init info video download
    const idVideoIDB = Date.now();
    this.infoVideoDownload[idVideoIDB] = {
      url,
      isPaused: false,
      arr: [],
      totalSegments: 0,
    };

    this.progress[idVideoIDB] = {
      idVideoIDB: 0,
    }

    // save info video download to indexedDB
    await this.indexDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);

    // save progress to indexedDB

    const tsUrls = await this.fetchM3u8Url(url);
    const data = await this.fetchSegments(tsUrls);
    console.log({ data })
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

import axios from "axios";
import { Parser } from "m3u8-parser";

import { VideoDownload } from "../../index.d";
import IndexedDBService from "./indexeddb-service";

class DownloadManager {
  private idVideoIDB: string;
  private progress: { [key: string]: number };
  private infoVideoDownload: { [key: string]: VideoDownload };
  private indexedDBService: IndexedDBService;
  private onProgress: (data: any) => void;
  private onSuccess: () => void;

  constructor() {
    this.idVideoIDB = '1';
    this.progress = {};
    this.infoVideoDownload = {};
    this.indexedDBService = new IndexedDBService();
    this.onProgress = () => {};
    this.onSuccess = () => {};
  }

  // fetch thumbnail from url and return Uint8Array
  async fetchThumbnail(url: string) {
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
  async fetchM3u8Url(urlVideo: string) {
    const position = urlVideo.indexOf(".m3u8");
    const baseURL = urlVideo.substring(0, urlVideo.lastIndexOf("/", position));

    const response = await axios.get(urlVideo);
    const playlistContent = response.data;

    const parser: any = new Parser();
    parser.push(playlistContent);
    parser.end();

    if (parser.manifest.playlists?.length && parser.manifest.playlists.length > 0) {
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
      const fullUrls = parser.manifest.segments.map((segment: any) => {
        const segmentUri = baseURL + "/" + segment.uri;
        return segmentUri;
      });
      return fullUrls;
    }
  }

  // create a promise fetch all segments from url
  async fetchSegments(tsUrls: string[]) {
    if (this.infoVideoDownload[this.idVideoIDB].arr.length > 0) {
      tsUrls.splice(0, this.infoVideoDownload[this.idVideoIDB].arr.length);
    }

    for (const url of tsUrls) {
      try {
        await this.fetchChunk(url);
      } catch (error) {
        throw error;
      }
    }
  }

  // fetch segment from url and return Uint8Array
  async fetchChunk(url: string) {
    // check if the user is offline or the video is paused or the number of videos being downloaded is greater than the maximum
    if (!navigator.onLine || !this.infoVideoDownload[this.idVideoIDB]) {
      return;
    }
    if (this.infoVideoDownload[this.idVideoIDB].isPaused) {
      return;
    }

    // fetch segment from url
    const response = await (await fetch(url)).arrayBuffer();
    const chunkData = new Uint8Array(response);

    // handle incase user fetch data successfully but user is cancel download
    if (!this.infoVideoDownload[this.idVideoIDB]) {
      return;
    }

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

    if (this.onSuccess && currentProgress === 100) {
      this.onSuccess();
    }

    // if the progress is greater than 100, return
    if (currentProgress > 100) {
      return;
    }
    await this.indexedDBService.save(this.idVideoIDB, this.infoVideoDownload[this.idVideoIDB]);
    return;
  }

  // start download
  async start(url: string, idVideoIDB: string, thumbnail: string, metadata: any, onProgress: () => void, onSuccess: () => void) {
    // init info video download
    this.infoVideoDownload[idVideoIDB] = {
      url,
      isPaused: false,
      arr: [],
      totalSegments: 0,
      thumbnail,
      metadata,
      segments: [],
    };
    this.idVideoIDB = idVideoIDB;
    this.onProgress = onProgress;
    this.onSuccess = onSuccess;

    // init progress
    this.progress[idVideoIDB] = 0;

    // save thumbnail to indexedDB
    if (thumbnail) {
      const thumbnailUint8Array = await this.fetchThumbnail(thumbnail);
      if (thumbnailUint8Array) {
        this.infoVideoDownload[idVideoIDB].thumbnail = thumbnailUint8Array;
      }
    }

    // save info video download to indexedDB
    await this.indexedDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);

    const tsUrls = await this.fetchM3u8Url(url);
    if (!tsUrls) {
      throw new Error("No segments found");
    }

    this.infoVideoDownload[idVideoIDB].totalSegments = tsUrls.length;
    this.infoVideoDownload[idVideoIDB].segments = tsUrls;

    // save info video download to indexedDB
    await this.indexedDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);

    await this.fetchSegments(tsUrls);
  }

  // pause download
  async pause(idVideoIDB: string) {
    // if the number of segments downloaded is equal to the total number of segments, return
    if (this.infoVideoDownload[idVideoIDB].arr.length === this.infoVideoDownload[idVideoIDB].totalSegments) {
      return;
    }
    
    this.infoVideoDownload[idVideoIDB].isPaused = true;
    await this.indexedDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);
  }

  // resume download
  async resume(idVideoIDB: string) {
    // if the number of segments downloaded is equal to the total number of segments, return
    if (this.infoVideoDownload[idVideoIDB].arr.length === this.infoVideoDownload[idVideoIDB].totalSegments) {
      return;
    }
    
    this.infoVideoDownload[idVideoIDB].isPaused = false;
    await this.fetchSegments(this.infoVideoDownload[idVideoIDB].segments);
  }

  // cancel download
  async cancel(idVideoIDB: string) {
    delete this.infoVideoDownload[idVideoIDB];
    await this.indexedDBService.delete(idVideoIDB);
  }
}

export default DownloadManager;

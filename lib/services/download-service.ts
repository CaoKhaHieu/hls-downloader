import axios from "axios";
import { Parser } from "m3u8-parser";

import { HLSDownloaderCallback, HLSDownloaderOptions, VideoDownload } from "../../index.d";
import IndexedDBService from "./indexeddb-service";

class DownloadService {
  private progress: { [key: string]: number };
  private infoVideoDownload: { [key: string]: VideoDownload };
  private indexedDBService: IndexedDBService;
  private onSuccess: (idVideoIDB: string) => void;
  private onError: (error: Error) => void;
  private onProgress: (idVideoIDB: string, progress: number) => void;

  constructor({
    onProgress,
    onSuccess,
    onError,
  }: HLSDownloaderCallback) {
    this.progress = {};
    this.infoVideoDownload = {};
    this.indexedDBService = new IndexedDBService();
    this.onSuccess = onSuccess || (() => {});
    this.onError = onError || (() => {});
    this.onProgress = onProgress || (() => {});
  }

  // fetch thumbnail from url and return Uint8Array
  async fetchThumbnail(url: string) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      return uint8Array;
    } catch (error) {
      this.onError(error as Error);
      return null;
    }
  }

  // get all segments from m3u8 url
  async fetchM3u8Url(urlVideo: string) {
    const position = urlVideo.indexOf(".m3u8");
    const baseURL = urlVideo.substring(0, urlVideo.lastIndexOf("/", position));

    try {
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
    } catch (error) {
      this.onError(error as Error);
    }
  }

  // create a promise fetch all segments from url
  async fetchSegments(tsUrls: string[], idVideoIDB: string) {
    if (!tsUrls || tsUrls.length === 0) {
      this.onError(new Error("No segments found"));
      return;
    }
    for (const url of tsUrls) {
      try {
        await this.fetchChunk(url, idVideoIDB);
      } catch (error) {
        throw error;
      }
    }
  }

  // fetch segment from url and return Uint8Array
  async fetchChunk(url: string, idVideoIDB: string) {
    // check if the user is offline or the video is paused or the number of videos being downloaded is greater than the maximum
    if (!navigator.onLine || !this.infoVideoDownload[idVideoIDB]) {
      return;
    }
    if (this.infoVideoDownload[idVideoIDB].isPaused) {
      return;
    }

    try {
      // fetch segment from url
      const response = await (await fetch(url)).arrayBuffer();
      const chunkData = new Uint8Array(response);

      // handle incase user fetch data successfully but user is cancel download
      if (!this.infoVideoDownload[idVideoIDB]) {
        return;
      }

      // save chunk data to info video download
      this.infoVideoDownload[idVideoIDB].arr.push(chunkData);

      // update progress
      const currentProgress = Math.floor(
        (this.infoVideoDownload[idVideoIDB].arr.length /
          this.infoVideoDownload[idVideoIDB].totalSegments) *
          100
      );
      this.progress[idVideoIDB] = currentProgress;
      this.onProgress(idVideoIDB, currentProgress);

      if (this.onSuccess && currentProgress === 100) {
        this.onSuccess(idVideoIDB);
      }

      // if the progress is greater than 100, return
      if (currentProgress > 100) {
        return;
      }
      await this.indexedDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);
      return;
    } catch (error) {
      this.onError(error as Error);
    }
  }

  // start download
  async start(data: HLSDownloaderOptions) {
    const { url, idVideoIDB, thumbnail, metadata } = data;
    // init info video download
    this.infoVideoDownload[idVideoIDB] = {
      url,
      isPaused: false,
      arr: [],
      totalSegments: 0,
      thumbnail: thumbnail || '',
      metadata,
      segments: [],
    };
    
    // init progress
    this.progress[idVideoIDB] = 0;

    // save thumbnail to indexedDB
    if (thumbnail) {
      const thumbnailUint8Array = await this.fetchThumbnail(thumbnail);
      if (!thumbnailUint8Array) {
        return;
      }
      this.infoVideoDownload[idVideoIDB].thumbnail = thumbnailUint8Array;
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

    await this.fetchSegments(tsUrls, idVideoIDB);
  }

  // pause download
  async pause(idVideoIDB: string) {
    if (!this.infoVideoDownload[idVideoIDB]) {
      return;
    }

    // if the number of segments downloaded is equal to the total number of segments, return
    if (this.infoVideoDownload[idVideoIDB].arr.length === this.infoVideoDownload[idVideoIDB].totalSegments) {
      return;
    }
    
    this.infoVideoDownload[idVideoIDB].isPaused = true;
    await this.indexedDBService.save(idVideoIDB, this.infoVideoDownload[idVideoIDB]);
  }

  // resume download
  async resume(idVideoIDB: string) {
    // handle case resume download after reload page
    if (!this.infoVideoDownload[idVideoIDB]) {
      const video = await this.indexedDBService.get(idVideoIDB);
      if (!video) {
        return;
      }
      this.infoVideoDownload[idVideoIDB] = video;
    }

    // if the number of segments downloaded is equal to the total number of segments, return
    if (this.infoVideoDownload[idVideoIDB].arr.length === this.infoVideoDownload[idVideoIDB].totalSegments) {
      return;
    }

    const tsUrls = [...this.infoVideoDownload[idVideoIDB].segments];
    if (this.infoVideoDownload[idVideoIDB].arr.length > 0) {
      tsUrls.splice(0, this.infoVideoDownload[idVideoIDB].arr.length);
    }
    this.infoVideoDownload[idVideoIDB].isPaused = false;
    await this.fetchSegments(tsUrls, idVideoIDB);
  }

  // cancel download
  async cancel(idVideoIDB: string) {
    delete this.infoVideoDownload[idVideoIDB];
    await this.indexedDBService.delete(idVideoIDB);
  }
}

export default DownloadService;

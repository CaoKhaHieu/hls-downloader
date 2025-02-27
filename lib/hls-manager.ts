import { VideoDownload } from "../index.d";
import IndexedDBService from "./services/indexeddb-service";

class HLSManager {
  private indexedDBService: IndexedDBService;

  constructor() {
    this.indexedDBService = new IndexedDBService();
  }

  // delete video
  async deleteVideo(idVideoIDB: string) {
    await this.indexedDBService.delete(idVideoIDB);
  }

  // get video
  async getVideo(idVideoIDB: string) {
    return await this.indexedDBService.get(idVideoIDB);
  }

  // get thumbnail video downloaded
  async getThumbnailVideoDownloaded(idVideoIDB: string) {
    const video = await this.indexedDBService.get(idVideoIDB);
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
    return await this.indexedDBService.getAll();
  }

  // get all videos downloaded
  async getAllVideosDownloaded() {
    const videos = await this.indexedDBService.getAll();
    if (!videos) {
      return [];
    }
    return videos.filter((video: VideoDownload) => video.arr.length === video.totalSegments);
  }

  // get all videos downloading
  async getAllVideosDownloading() {
    const videos = await this.indexedDBService.getAll();
    if (!videos) {
      return [];
    }
    return videos.filter((video: VideoDownload) => video.arr.length < video.totalSegments);
  }

  // delete all videos
  async deleteAllVideos() {
    return await this.indexedDBService.deleteAll();
  }
}

export default HLSManager;

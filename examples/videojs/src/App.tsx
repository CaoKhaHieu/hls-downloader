import { useEffect, useRef, useState } from "react";
import "./App.css";

import { HLSDownloader, HLSManager, VideoDownload } from "@caokhahieu/hls-downloader";
import { Toaster, toast } from "sonner";

import videojs from "video.js";
import "video.js/dist/video-js.css";

import muxjs from "mux.js";

const urls = [
  "https://vod02.cdn.web.tv/ps/fp/psfpskkrfpm_,240,360,.mp4.urlset/master.m3u8",
  "https://vod.ottclouds.com/vods/9999/CcRxJOQgiwAFdpmYc7oezZM4Tvah7Lmp4/playlist.m3u8"
];

function App() {
  const [isInit, setIsInit] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<any>(null);
  const playerRef = useRef<any>(null);

  const mediaSource = new MediaSource();
  const transmuxer = new muxjs.mp4.Transmuxer();
  const mime = 'video/mp4; codecs="mp4a.40.2,avc1.64001f"';

  const hlsDownloader = useRef<HLSDownloader>(new HLSDownloader({
    onProgress: (idVideoIDB: string, progress: number) => {
      setProgress(progress);
    },
    onSuccess: () => {
      toast("Download success");
    },
    onError: () => {
      toast("Download error");
    },
  }));
  const hlsManager = useRef<HLSManager>(new HLSManager());

  useEffect(() => {
    hlsDownloader.current.initIndexedDB().then(() => {
      setIsInit(true);
    });
  }, []);

  useEffect(() => {
    const options = {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
    };
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
    }
  }, [videoRef]);

  useEffect(() => {
    if (!isInit) {
      return;
    }
    // init video download
    hlsManager.current.getVideo("1").then((video: VideoDownload) => {
      if (video && video.arr.length > 0) {
        const mergedArray = mergeListArrayBuffer([...video.arr]);
        const blob = URL.createObjectURL(mediaSource);
        playerRef.current.src({
          src: blob,
          type: "video/mp4",
        });
        mediaSource.addEventListener("sourceopen", () =>
          appendSegments(mergedArray)
        );
      }
    });
  }, [isInit]);

  const handleDownload = () => {
    hlsDownloader.current.start({
      url: urls[0],
      idVideoIDB: "1",
      thumbnail: "",
      metadata: {
        title: "Nong trua 22t2",
        description: "Nong trua 22t2",
      },
    });
  };

  const handlePause = () => {
    hlsDownloader.current.pause("1");
  };

  const handleResume = () => {
    hlsDownloader.current.resume("1");
  };

  const handleCancel = () => {
    hlsDownloader.current.cancel("1");
  };

  const appendSegments = (data: Uint8Array) => {
    URL.revokeObjectURL(videoRef.current.src);
    const sourceBuffer = mediaSource.addSourceBuffer(mime);
    sourceBuffer.addEventListener("updateend", () => {
      mediaSource.endOfStream();
    });
    transmuxer.on("data", (segment: any) => {
      const data = new Uint8Array(
        segment.initSegment.byteLength + segment.data.byteLength
      );
      data.set(segment.initSegment, 0);
      data.set(segment.data, segment.initSegment.byteLength);
      sourceBuffer.appendBuffer(data);
    });
    transmuxer.push(new Uint8Array(data));
    transmuxer.flush();
  };

  const mergeListArrayBuffer = (myArrays: Uint8Array[]) => {
    let length = 0;
    myArrays.forEach((item) => {
      length += item.length;
    });
    const mergedArray = new Uint8Array(length);
    let offset = 0;
    myArrays.forEach((item) => {
      mergedArray.set(item, offset);
      offset += item.length;
    });

    return mergedArray;
  };

  return (
    <>
      <Toaster />
      <div>
        <input
          type="text"
          value={urls[0]}
          placeholder="Please enter the HLS url to download ..."
          style={{
            padding: "16px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            width: "500px",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "100px", marginTop: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <p>Progress: {progress}%</p>
          </div>
          <button onClick={handleDownload}>Download video</button>
          <button onClick={handlePause}>Pause</button>
          <button onClick={handleResume}>Resume</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>

        <div data-vjs-player style={{ width: "500px", height: "auto" }}>
          <div ref={videoRef} />
        </div>
      </div>
    </>
  );
}

export default App;

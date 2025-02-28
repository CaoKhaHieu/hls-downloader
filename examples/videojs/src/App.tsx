import { useEffect, useRef, useState } from "react";
import "./App.css";

import { HLSDownloader, HLSManager } from "../../../lib/index";
import { Toaster, toast } from "sonner";

import videojs from "video.js";
import "video.js/dist/video-js.css";

import muxjs from "mux.js";

function App() {
  const [isInit, setIsInit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(
    "https://vod02.cdn.web.tv/ps/fp/psfpskkrfpm_,240,360,.mp4.urlset/master.m3u8"
  );

  const videoRef = useRef<any>(null);
  const playerRef = useRef<any>(null);

  const mediaSource = new MediaSource();
  const transmuxer = new muxjs.mp4.Transmuxer();
  const mime = 'video/mp4; codecs="mp4a.40.2,avc1.64001f"';

  const hlsDownloader = new HLSDownloader({
    url,
    idVideoIDB: "1",
    thumbnail: "",
    metadata: {
      title: "Nong trua 22t2",
      description: "Nong trua 22t2",
      author: "Nong trua 22t2",
      duration: 100,
      thumbnail:
        "https://vtvgo-vods.vtvdigital.vn/RTJC-PMXuacVrExErCl_Tw/1740628543/vod/20250222/nong-trua-22t2.mp4/index.m3u8",
    },
    onProgress: (data) => {
      console.log(data);
      setProgress(data.progress);
    },
    onSuccess: () => {
      toast("Download success");
    },
    onPause: () => {
      toast("Pause");
    },
    onResume: () => {
      toast("Resume");
    },
    onCancel: () => {
      toast("Cancel");
    },
  });
  const hlsManager = new HLSManager();

  useEffect(() => {
    hlsDownloader.initIndexedDB().then(() => {
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
    hlsManager.getVideo("1").then((video) => {
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
    hlsDownloader.start();
  };

  const handlePause = () => {
    hlsDownloader.pause();
  };

  const handleResume = () => {
    hlsDownloader.resume();
  };

  const handleCancel = () => {
    hlsDownloader.cancel();
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
          value={url}
          onChange={(e) => setUrl(e.target.value)}
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

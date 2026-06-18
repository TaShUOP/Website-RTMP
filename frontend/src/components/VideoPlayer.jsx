import React, { useEffect, useRef } from 'react';
import flvjs from 'flv.js';

const VideoPlayer = ({ streamUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let flvPlayer = null;

    if (flvjs.isSupported()) {
      const videoElement = videoRef.current;
      flvPlayer = flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        url: streamUrl,
      }, {
        enableWorker: false,
        enableStashBuffer: false,
        stashInitialSize: 128,
      });

      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();
      
      flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail, errorInfo) => {
        console.error('FLV.js Error:', errorType, errorDetail, errorInfo);
      });

      const playPromise = flvPlayer.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Auto-play was prevented or failed:", error);
        });
      }
    }

    return () => {
      if (flvPlayer) {
        flvPlayer.pause();
        flvPlayer.unload();
        flvPlayer.detachMediaElement();
        flvPlayer.destroy();
        flvPlayer = null;
      }
    };
  }, [streamUrl]);

  return (
    <video
      ref={videoRef}
      className="video-element"
      controls
      muted
      autoPlay
    />
  );
};

export default VideoPlayer;

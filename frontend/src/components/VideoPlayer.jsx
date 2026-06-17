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
        hasAudio: true,
        url: streamUrl,
      });

      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();
      
      const playPromise = flvPlayer.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Auto-play was prevented. User interaction required.");
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

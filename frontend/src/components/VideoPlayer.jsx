import React, { useEffect, useRef } from 'react';
import flvjs from 'flv.js';

const VideoPlayer = ({ streamUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const hlsUrl = streamUrl.replace('.flv', '/index.m3u8');
    let flvPlayer = null;

    // 1. Native HLS Support (iOS / iPhones / Safari)
    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = hlsUrl;
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.error("HLS Auto-play prevented:", error));
      }
    } 
    // 2. FLV.js Support (Desktop / Android / Chrome / Firefox)
    else if (flvjs.isSupported()) {
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
        playPromise.catch(error => console.error("FLV Auto-play prevented:", error));
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
      
      // Cleanup for native HLS
      if (videoElement) {
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    };
  }, [streamUrl]);

  return (
    <video
      ref={videoRef}
      className="player"
      controls
      muted
      autoPlay
    />
  );
};

export default VideoPlayer;

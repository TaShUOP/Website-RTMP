import React, { useEffect, useRef } from 'react';
import flvjs from 'flv.js';

const VideoPlayer = ({ streamUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let flvPlayer = null;

    if (flvjs.isSupported()) {
      flvPlayer = flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        hasAudio: true,
        hasVideo: true,
        url: streamUrl,
      }, {
        enableStashBuffer: false,
        isLive: true,
        lazyLoad: false
      });

      flvPlayer.attachMediaElement(videoRef.current);
      flvPlayer.load();
      
      const playPromise = flvPlayer.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.log('Auto-play was prevented or failed:', e);
        });
      }
    }

    return () => {
      if (flvPlayer) {
        flvPlayer.pause();
        flvPlayer.unload();
        flvPlayer.detachMediaElement();
        flvPlayer.destroy();
      }
    };
  }, [streamUrl]);

  return (
    <div className="player">
      <video 
        ref={videoRef} 
        controls 
        muted
        playsInline
        className="player"
      />
    </div>
  );
};

export default VideoPlayer;

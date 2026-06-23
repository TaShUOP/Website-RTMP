import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ streamUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    let hls = null;
    let retryTimeout = null;

    const initPlayer = () => {
      // 1. hls.js Support (Desktop / Android / modern browsers with MSE)
      if (Hls.isSupported()) {
        hls = new Hls({
          maxLiveSyncPlaybackRate: 1.5,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => console.error("HLS Auto-play prevented:", e));
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch(data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Network error (e.g. stream not started yet). Retry logic.
                console.log('HLS Network Error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('HLS Media Error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } 
      // 2. Native HLS Support (iOS / iPhones / Safari)
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        const loadNativeHls = () => {
          video.src = streamUrl;
          video.load();
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => console.error("Native HLS Auto-play prevented:", e));
          }
        };

        const handleNativeError = () => {
          console.log("Native HLS stream not ready yet, retrying in 3 seconds...");
          retryTimeout = setTimeout(loadNativeHls, 3000);
        };

        video.addEventListener('error', handleNativeError);
        loadNativeHls();

        // Save reference to remove listener on cleanup
        video._handleError = handleNativeError;
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (video) {
        if (video._handleError) {
          video.removeEventListener('error', video._handleError);
        }
        video.removeAttribute('src');
        video.load();
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
      playsInline
    />
  );
};

export default VideoPlayer;

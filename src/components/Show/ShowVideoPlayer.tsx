"use client";

import classNames from "classnames";
import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-youtube";

import "../../styles/Show/VideoPlayer.module.css";

export default function ShowVideoPlayer({ videoId }: { videoId: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        techOrder: ["youtube"],
        sources: [
          {
            type: "video/youtube",
            src: `https://www.youtube.com/watch?v=${videoId}`,
          },
        ],
        youtube: {
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        controls: true,
        responsive: true,
        fluid: true,
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <section className="videoPlayer">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className={classNames("video-js", "vjs-big-play-centered")}
        />
      </div>
    </section>
  );
}

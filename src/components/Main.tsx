import React, { useEffect, useRef, useState, useCallback } from "react";
import type { FC, HTMLProps } from "react";
import { formatVideoTime, isMobile } from "../shared/utils";
import CircularProgress from "./Icons/CircularProgress";
import ClickAwayListener from "./ClickAwayListener";
import Cog from "./Icons/Cog";
import ExitFullScreen from "./Icons/ExitFullScreen";
import FullScreen from "./Icons/FullScreen";
import Pause from "./Icons/Pause";
import PauseEffect from "./Effect/PauseEffect";
import PictureInPicture from "./Icons/PictureInPicture";
import Play from "./Icons/Play";
import PlayEffect from "./Effect/PlayEffect";
import type { PlayerProps } from "../shared/types";
import SettingsDialog from "./SettingsDialog";
import SettingsModal from "./SettingsModal";
import Subtitle from "./Icons/Subtitle";
import VolumeFull from "./Icons/VolumeFull";
import VolumeHalf from "./Icons/VolumeHalf";
import VolumeMuted from "./Icons/VolumeMuted";
import { useEffectUpdate } from "../hooks/useEffectUpdate";

const Player: FC<PlayerProps> = ({
  playerKey,
  src,
  subtitles,
  children,
  poster,
  seekDuration = 10,
  internationalization,
  playerRef: passedDownRef,
  pictureInPicture = false,
  keyboardShortcut = true,
  preserve = {
    watchTime: true,
    playbackSpeed: true,
    volume: true,
  },
}) => {
  const [quality, setQuality] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(
    preserve.playbackSpeed ? Number(localStorage.getItem("tuby-speed")) || 1 : 1
  );
  const [paused, setPaused] = useState(true);
  const [onFullScreen, setOnFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsActive, setSettingsActive] = useState(false);
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [seekPreview, setSeekPreview] = useState<null | {
    time: number;
    offset: number;
  }>(null);

  const [loadedData, setLoadedData] = useState(false);

  const [volume, setVolume] = useState(
    !preserve.volume &&
      isNaN(parseInt(localStorage.getItem("tuby-volume") as string))
      ? 100
      : Number(localStorage.getItem("tuby-volume"))
  );
  const [isMuted, setIsMuted] = useState(
    preserve.volume
      ? Boolean(Number(localStorage.getItem("tuby-muted")))
      : false
  );

  const [hoverEnabled, setHoverEnabled] = useState(true);

  const [pauseDidUpdate, setPauseDidUpdate] = useState(false);

  const myRef = useRef<HTMLVideoElement>(null);
  const playerRef = passedDownRef || myRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const mouseDownRef = useRef<Boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | number | null>(
    null
  );
  const fullscreenToggleButton = useRef<HTMLButtonElement>(null);
  const pauseButton = useRef<HTMLButtonElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);
  const subtitleButtonRef = useRef<HTMLButtonElement>(null);

  const updateHoverState = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoverEnabled(true);
    timeoutRef.current = setTimeout(() => {
      setHoverEnabled(false);
    }, 2000);
  };

  const toggleSound = () => {
    setIsMuted(!isMuted);
    setVolume(volume === 0 ? 100 : volume);
  };

  const handleSeeking = (offsetX: number) => {
    if (!playerRef.current || !seekRef.current) return;

    const offset =
      (offsetX - seekRef.current.getBoundingClientRect().left) /
      seekRef.current.offsetWidth;

    const newTime =
      (Math.abs(offset) === Infinity || isNaN(offset) ? 0 : offset) *
      playerRef.current.duration;

    playerRef.current.currentTime = newTime;

    setCurrentTime(newTime);
  };

  const handleSeekPreview = (offsetX: number) => {
    if (!playerRef.current || !seekRef.current) return;

    const left = seekRef.current.getBoundingClientRect().left;

    let offsetInPercentage = (offsetX - left) / seekRef.current.offsetWidth;

    offsetInPercentage =
      Math.abs(offsetInPercentage) === Infinity || isNaN(offsetInPercentage)
        ? 0
        : offsetInPercentage;

    const offsetInPixel = offsetInPercentage * seekRef.current.offsetWidth;

    let newTime = offsetInPercentage * playerRef.current.duration;

    if (isNaN(newTime)) setSeekPreview(null);

    if (newTime < 0) newTime = 0;

    setSeekPreview({
      time: Math.round(newTime),
      offset: offsetInPixel,
    });
  };

  const listenMouseMoveSeeking = () => {
    const moveHandler = (e: MouseEvent) => {
      handleSeekPreview(e.clientX);
      if (mouseDownRef.current) {
        handleSeeking(e.clientX);
      }
    };
    window.addEventListener("mousemove", moveHandler);

    const touchMoveHandler = (e: TouchEvent) => {
      handleSeekPreview(e.touches?.[0]?.pageX);
      if (mouseDownRef.current) {
        handleSeeking(e.touches?.[0]?.pageX);
      }
    };
    window.addEventListener("touchmove", touchMoveHandler);

    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", moveHandler);
      mouseDownRef.current = false;
      setSeekPreview(null);
    });

    window.addEventListener("touchend", () => {
      window.removeEventListener("touchmove", touchMoveHandler);
      mouseDownRef.current = false;
      setSeekPreview(null);
    });
  };

  const handleScreenClicked = (
    e: React.MouseEvent<HTMLVideoElement> | React.MouseEvent<HTMLDivElement>
  ) => {
    if (settingsActive) {
      setSettingsActive(false);
    } else {
      setPaused((prev) => !prev);
    }

    if (e.detail === 2 && !isMobile()) {
      setOnFullScreen((prev) => !prev);
    }
  };

  useEffectUpdate(() => {
    updateHoverState();
    setPauseDidUpdate(true);
    if (paused) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [paused]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.muted = isMuted;
      playerRef.current.volume = isMuted ? 0 : volume / 100;
    }

    if (preserve.volume) {
      localStorage.setItem("tuby-volume", String(volume));
      localStorage.setItem("tuby-muted", String(+isMuted));
    }
  }, [volume, isMuted, playerRef, preserve.volume]);

  useEffect(() => {
    const changeHandler = () => {
      const doc = document as any;
      const fullscreenElement =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.webkitCurrentFullScreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;

      if (fullscreenElement) {
        setOnFullScreen(true);
      } else {
        setOnFullScreen(false);
      }
    };

    document.addEventListener("fullscreenchange", changeHandler);
    document.addEventListener("webkitfullscreenchange", changeHandler);
    document.addEventListener("mozfullscreenchange", changeHandler);
    document.addEventListener("MSFullscreenChange", changeHandler);

    const endFullScreenHandler = () => {
      changeHandler();
      setPaused(true);
    };

    const player = playerRef.current;

    player?.addEventListener("webkitendfullscreen", endFullScreenHandler);

    return () => {
      document.removeEventListener("fullscreenchange", changeHandler);
      document.removeEventListener("webkitfullscreenchange", changeHandler);
      document.removeEventListener("mozfullscreenchange", changeHandler);
      document.removeEventListener("MSFullscreenChange", changeHandler);

      player?.removeEventListener("webkitendfullscreen", endFullScreenHandler);
    };
  }, [playerRef]);

  useEffectUpdate(() => {
    try {
      if (onFullScreen) {
        if (isMobile()) {
          const elem = playerRef.current as any;
          if (elem) {
            const requestFullScreen =
              elem.requestFullscreen ||
              elem.webkitRequestFullscreen ||
              elem.webkitRequestFullScreen ||
              elem.webkitEnterFullscreen ||
              elem.mozRequestFullScreen ||
              elem.msRequestFullscreen;
            requestFullScreen
              ?.call(elem)
              .catch((err: unknown) => console.error(err));
          }
        } else {
          const elem = containerRef.current as any;
          if (elem) {
            const requestFullScreen =
              elem.requestFullscreen ||
              elem.webkitRequestFullscreen ||
              elem.webkitRequestFullScreen ||
              elem.webkitEnterFullscreen ||
              elem.mozRequestFullScreen ||
              elem.msRequestFullscreen;
            requestFullScreen
              ?.call(elem)
              .catch((err: unknown) => console.error(err));
          }
        }
      } else {
        if (document.fullscreenElement) {
          const doc = document as any;
          const exitFullScreen =
            doc.exitFullscreen ||
            doc.webkitExitFullscreen ||
            doc.webkitCancelFullScreen ||
            doc.mozCancelFullScreen ||
            doc.msExitFullscreen;
          exitFullScreen
            ?.call(document)
            .catch((err: unknown) => console.error(err));
        }
      }
    } catch (error) {
      /* Empty */
    }
    updateHoverState();
  }, [onFullScreen]);

  useEffectUpdate(() => {
    if (!playerRef.current) return;

    playerRef.current.addEventListener(
      "loadeddata",
      () => {
        if (playerRef.current) {
          if (currentTime) {
            playerRef.current.currentTime = currentTime;
            playerRef.current.play();
          }
        }
      },
      { once: true }
    );

    playerRef.current.addEventListener("error", () => {
      playerRef.current?.pause();
    });
  }, [quality]);

  useEffect(() => {
    if (!playerRef.current) return;

    if (preserve.playbackSpeed) {
      localStorage.setItem("tuby-speed", String(playbackSpeed));
    }

    playerRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, playerRef, preserve.playbackSpeed]);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (!keyboardShortcut) return;
      const seekTime = (amount: number) => {
        playerRef.current && (playerRef.current.currentTime += amount);
      };
      if (containerRef.current?.contains(document.activeElement)) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
      // Pause
      if (
        (keyboardShortcut === true || keyboardShortcut.pause) &&
        (e.key === " " || e.key === "k")
      )
        pauseButton.current?.click();
      // Rewind
      if (
        (keyboardShortcut === true || keyboardShortcut.rewind) &&
        e.key === "ArrowLeft"
      )
        seekTime(-seekDuration);
      // Forward
      if (
        (keyboardShortcut === true || keyboardShortcut.forward) &&
        e.key === "ArrowRight"
      )
        seekTime(seekDuration);
      // Full screen
      if (
        (keyboardShortcut === true || keyboardShortcut.fullScreen) &&
        e.key === "f"
      )
        fullscreenToggleButton.current?.click();
      // Mute
      if ((keyboardShortcut === true || keyboardShortcut.mute) && e.key === "m")
        volumeButtonRef.current?.click();
      // Subtitle
      if (
        (keyboardShortcut === true || keyboardShortcut.subtitle) &&
        e.key === "c"
      )
        subtitleButtonRef.current?.click();
    };

    const spacePressHandler = (e: KeyboardEvent) => {
      if (keyboardShortcut && e.key === " ") e.preventDefault();
    };

    window.addEventListener("keyup", keyHandler);

    window.addEventListener("keydown", spacePressHandler);

    return () => {
      window.removeEventListener("keyup", keyHandler);
      window.removeEventListener("keydown", spacePressHandler);
    };
  }, [seekDuration, playerRef, keyboardShortcut]);

  useEffect(() => {
    const video = playerRef.current;
    if (!video) return;
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = "hidden";
    }
    if (
      subtitleIndex < video.textTracks.length &&
      video.textTracks &&
      video.textTracks[subtitleIndex]
    ) {
      video.textTracks[subtitleIndex].mode = "showing";
    }
  }, [playerRef, subtitleIndex]);

  const videoProps: HTMLProps<HTMLVideoElement> & { src: string } = {
    crossOrigin: "anonymous",
    playsInline: true,
    onClickCapture: handleScreenClicked,
    controls: false,
    src: typeof src === "string" ? src : src[quality].url,
    onWaiting: () => setLoading(true),
    onPlaying: () => {
      setLoading(false);
      setPaused(false);
    },
    onLoadedData: () => {
      setLoadedData(true);
      setDuration(playerRef.current?.duration || 0);
      let newCurrentTime;
      if (playerKey && preserve.watchTime) {
        newCurrentTime = Number(
          localStorage.getItem(`${playerKey}-time`) as string
        );
      } else newCurrentTime = 0;
      setCurrentTime(newCurrentTime);
      playerRef.current && (playerRef.current.currentTime = newCurrentTime);
    },
    onTimeUpdate: () => {
      if (playerKey && loadedData && preserve.watchTime) {
        localStorage.setItem(
          `${playerKey}-time`,
          String(playerRef.current?.currentTime || 0)
        );
      }
      setCurrentTime(playerRef.current?.currentTime || 0);
      setDuration(playerRef.current?.duration || 0);
    },
    onEnded: () => {
      setPaused(true);
    },
    onMouseMove: () => updateHoverState(),

    children: (
      <>
        {subtitles &&
          subtitles.length > 0 &&
          subtitleIndex >= 0 &&
          loadedData &&
          subtitles.map((sub, index) => (
            <track
              key={`react-tuby-player${playerKey ? `-${playerKey}` : ""}-${
                sub.lang
              }`}
              kind="subtitles"
              srcLang={sub.lang}
              label={sub.language}
              src={sub.url}
              default={index === 0}
            />
          ))}
      </>
    ),
  };

  return (
    <>
      {poster && !pauseDidUpdate && (
        <img src={poster} className="tuby-poster" alt="Tuby Poster" />
      )}
      <div
        ref={containerRef}
        className={`tuby-container ${
          hoverEnabled ? "tuby-controls-hovered" : ""
        }`}
      >
        {children ? (
          children(playerRef, videoProps)
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video ref={playerRef} {...videoProps} />
        )}

        {((!loadedData && pauseDidUpdate) || (loading && !paused)) && (
          <div className="tuby-center">
            <CircularProgress />
          </div>
        )}

        {paused && pauseDidUpdate && (
          <div className="tuby-center" onClickCapture={handleScreenClicked}>
            <PauseEffect />
          </div>
        )}

        {!paused && pauseDidUpdate && (
          <div className="tuby-center" onClickCapture={handleScreenClicked}>
            <PlayEffect />
          </div>
        )}

        {!pauseDidUpdate && (
          <div className="tuby-center" onClickCapture={handleScreenClicked}>
            <Play className="tuby-icon-md" />
          </div>
        )}
        <div
          onTouchEnd={() => setHoverEnabled(true)}
          onClick={() => setHoverEnabled(true)}
          onKeyDown={() => setHoverEnabled(true)}
          role="button"
          tabIndex={0}
          onMouseEnter={() =>
            timeoutRef.current && clearTimeout(timeoutRef.current)
          }
          className={`tuby-controls ${
            paused || settingsActive ? "tuby-show" : ""
          }`}
        >
          <div
            ref={seekRef}
            onMouseDown={(e) => {
              mouseDownRef.current = true;
              handleSeeking(e.clientX);
              listenMouseMoveSeeking();
            }}
            onTouchStart={(e) => {
              mouseDownRef.current = true;
              handleSeeking(e.touches?.[0]?.pageX);
              listenMouseMoveSeeking();
            }}
            onMouseMove={(e) => handleSeekPreview(e.clientX)}
            onMouseLeave={() => setSeekPreview(null)}
            role="button"
            tabIndex={0}
            className="tuby-seek"
          >
            <div className="tuby-seek-bar">
              <div
                style={{
                  width:
                    duration !== 0
                      ? `${Math.round((currentTime / duration) * 1000) / 10}%`
                      : 0,
                }}
                className="tuby-seek-left"
              ></div>
            </div>
            {seekPreview !== null && (
              <div
                className="tuby-seek-preview"
                style={{
                  left:
                    seekPreview.offset < 16
                      ? 0
                      : seekPreview.offset >
                        (seekRef.current?.offsetWidth || 0) - 16
                      ? "auto"
                      : seekPreview.offset,
                  right:
                    seekPreview.offset >
                    (seekRef.current?.offsetWidth || 0) - 16
                      ? 0
                      : "auto",
                  transform:
                    seekPreview.offset < 16 ||
                    seekPreview.offset >
                      (seekRef.current?.offsetWidth || 0) - 16
                      ? "none"
                      : "translateX(-50%)",
                }}
              >
                {formatVideoTime(seekPreview.time)}
              </div>
            )}
          </div>
          <div className="tuby-controls-main">
            <div className="tuby-controls-left">
              <button
                ref={pauseButton}
                className="tuby-center-container tuby-tooltips-left"
                data-tuby-tooltips={
                  paused
                    ? internationalization?.tooltipsPlay || "Play (k)"
                    : internationalization?.tooltipsPause || "Pause (k)"
                }
                onClickCapture={() => setPaused((prev) => !prev)}
                aria-label="Play or pause the video"
              >
                {paused ? (
                  <Play className="tuby-icon-sm" />
                ) : (
                  <Pause className="tuby-icon-sm" />
                )}
              </button>

              <div className="tuby-volume-container">
                <button
                  ref={volumeButtonRef}
                  className="tuby-center-container"
                  data-tuby-tooltips={
                    isMuted || volume === 0
                      ? internationalization?.tooltipsUnmute || "Unmute (m)"
                      : internationalization?.tooltipsMute || "Mute (m)"
                  }
                  onClickCapture={toggleSound}
                  aria-label="Click to either mute or unmute. Hover and use the slider next to the button to change the volume"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeMuted className="tuby-icon-sm" />
                  ) : volume === 100 ? (
                    <VolumeFull className="tuby-icon-sm" />
                  ) : (
                    <VolumeHalf className="tuby-icon-sm" />
                  )}
                </button>
                <div className="tuby-volume-wrapper">
                  <input
                    className="tuby-volume-slider"
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(+e.target.value);
                      setIsMuted(+e.target.value === 0);
                    }}
                    aria-label="Change the volume of the video"
                  />
                  <div
                    className="tuby-volume-left-bar"
                    style={{ width: isMuted ? 0 : volume * 0.52 }}
                  ></div>
                </div>
              </div>

              <div className="tuby-time">
                {formatVideoTime(currentTime)}
                {" / "}
                {formatVideoTime(duration)}
              </div>
            </div>

            <div className="tuby-controls-right">
              {Boolean(subtitles) && (
                <button
                  ref={subtitleButtonRef}
                  className={`tuby-center-container ${
                    subtitleIndex >= 0 ? "tuby-icon-underline" : ""
                  }`}
                  data-tuby-tooltips={
                    internationalization?.tooltipsSubtitles || "Subtitles (c)"
                  }
                  onClickCapture={() =>
                    subtitleIndex >= 0
                      ? setSubtitleIndex(-1)
                      : setSubtitleIndex(0)
                  }
                  aria-label="Toggle subtitles for this video"
                >
                  <Subtitle className="tuby-icon-sm" />
                </button>
              )}
              <ClickAwayListener onClickAway={() => setSettingsActive(false)}>
                {(ref) => (
                  <div ref={ref} style={{ position: "relative" }}>
                    <button
                      className="tuby-center-container"
                      onClickCapture={() => setSettingsActive((prev) => !prev)}
                      {...(!settingsActive
                        ? {
                            "data-tuby-tooltips":
                              internationalization?.tooltipsSettings ||
                              "Settings",
                          }
                        : {})}
                      aria-label="Open settings for this video"
                    >
                      <Cog className="tuby-icon-sm" />
                    </button>

                    {!isMobile() ? (
                      <SettingsDialog
                        settingsActive={settingsActive}
                        setSettingsActive={setSettingsActive}
                        src={src}
                        subtitles={subtitles}
                        playbackSpeed={playbackSpeed}
                        setPlaybackSpeed={setPlaybackSpeed}
                        subtitleIndex={subtitleIndex}
                        setSubtitleIndex={setSubtitleIndex}
                        quality={quality}
                        setQuality={setQuality}
                        internationalization={internationalization}
                      />
                    ) : (
                      <SettingsModal
                        settingsActive={settingsActive}
                        setSettingsActive={setSettingsActive}
                        src={src}
                        subtitles={subtitles}
                        playbackSpeed={playbackSpeed}
                        setPlaybackSpeed={setPlaybackSpeed}
                        subtitleIndex={subtitleIndex}
                        setSubtitleIndex={setSubtitleIndex}
                        quality={quality}
                        setQuality={setQuality}
                        internationalization={internationalization}
                      />
                    )}
                  </div>
                )}
              </ClickAwayListener>

              {pictureInPicture && document?.pictureInPictureEnabled && (
                <button
                  className="tuby-center-container"
                  ref={fullscreenToggleButton}
                  data-tuby-tooltips="Picture in Picture"
                  onClickCapture={() => {
                    try {
                      if (document?.pictureInPictureElement)
                        document?.exitPictureInPicture();
                      else playerRef.current?.requestPictureInPicture();
                    } catch (error) {
                      /* Empty */
                    }
                  }}
                  aria-label="Enable Picture in Picture"
                >
                  <PictureInPicture className="tuby-icon-sm" />
                </button>
              )}

              <button
                className="tuby-center-container tuby-tooltips-right"
                ref={fullscreenToggleButton}
                data-tuby-tooltips={`${
                  onFullScreen
                    ? internationalization?.tooltipsExitFullscreen ||
                      "Exit full screen (f)"
                    : internationalization?.tooltipsFullscreen ||
                      "Full screen (f)"
                }`}
                onClickCapture={() => setOnFullScreen((prev) => !prev)}
                aria-label="Exit or enter full screen mode"
              >
                {onFullScreen ? (
                  <ExitFullScreen className="tuby-icon-sm" />
                ) : (
                  <FullScreen className="tuby-icon-sm" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;

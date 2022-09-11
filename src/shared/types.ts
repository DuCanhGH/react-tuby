import { HTMLProps, RefObject, ReactElement } from "react";

interface Internationalization {
  tooltipsPlay?: string;
  tooltipsPause?: string;
  tooltipsMute?: string;
  tooltipsUnmute?: string;
  tooltipsSubtitles?: string;
  tooltipsSettings?: string;
  tooltipsFullscreen?: string;
  tooltipsExitFullscreen?: string;
  settingsPlaybackSpeed?: string;
  settingsPlaybackSpeedNormal?: string;
  settingsSubtitles?: string;
  settingsSubtitlesOff?: string;
  settingsQuality?: string;
  settingsModalOff?: string;
}

export interface SubtitleType {
  lang: string;
  language: string;
  url: string;
}

export type SrcType =
  | {
      quality: number | string;
      url: string;
    }[]
  | string;

export type RendererType = (
  ref: RefObject<HTMLVideoElement>,
  props: HTMLProps<HTMLVideoElement> & { src: string }
) => ReactElement;

interface BasePlayerProps {
  src: SrcType;
  subtitles?: SubtitleType[];
  dimensions?: number | { width: number | string; height: number | string };
  primaryColor?: string;
  poster?: string;
  seekDuration?: number;
  internationalization?: Internationalization;
  pictureInPicture?: boolean;
  keyboardShortcut?:
    | boolean
    | {
        pause?: boolean;
        rewind?: boolean;
        forward?: boolean;
        fullScreen?: boolean;
        mute?: boolean;
        subtitle?: boolean;
      };
  playerRef?: RefObject<HTMLVideoElement>;
  children?: RendererType;
  preserve?: {
    volume?: boolean;
    playbackSpeed?: boolean;
  };
}

interface HasPlayerKeyPlayerProps extends BasePlayerProps {
  playerKey: string;
  preserve?: BasePlayerProps["preserve"] & {
    watchTime?: boolean;
  };
}

interface NoPlayerKeyPlayerProps extends BasePlayerProps {
  playerKey?: undefined;
  preserve?: BasePlayerProps["preserve"] & {
    watchTime?: undefined;
  };
}

export type PlayerProps = HasPlayerKeyPlayerProps | NoPlayerKeyPlayerProps;

export interface SettingsProps {
  settingsActive: boolean;
  setSettingsActive: Function;
  subtitles?: {
    lang: string;
    language: string;
    url: string;
  }[];
  src:
    | {
        quality: number | string;
        url: string;
      }[]
    | string;
  playbackSpeed: number;
  setPlaybackSpeed: (value: number) => void;
  subtitleIndex: number;
  setSubtitleIndex: (value: number) => void;
  quality: number;
  setQuality: (value: number) => void;
  internationalization?: Internationalization;
}

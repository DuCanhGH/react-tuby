import React, {
  Component,
  HTMLProps,
  ReactElement,
  createRef,
  RefObject,
} from "react";

import { PlayerProps } from "../shared/types";

interface Props extends PlayerProps {
  renderer?: (
    ref: RefObject<HTMLVideoElement>,
    props: HTMLProps<HTMLVideoElement> & { src: string }
  ) => ReactElement;
  children?: any;
}

class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  playerRef: RefObject<HTMLVideoElement>;
  videoProps: HTMLProps<HTMLVideoElement> & { src: string };
  constructor(
    props: Props
  ) {
    super(props);
    this.state = { hasError: false };
    this.playerRef = createRef<HTMLVideoElement>();

    this.videoProps = {
      crossOrigin: "anonymous",
      playsInline: true,
      controls: true,
      src:
        typeof this.props.src === "string"
          ? this.props.src
          : this.props.src[0].url,
      children: (
        <>
          {this.props.subtitles &&
            this.props.subtitles.length > 0 &&
            this.props.subtitles.map((subtitle, index) => (
              <track
                key={subtitle.lang}
                kind="subtitles"
                srcLang={subtitle.lang}
                label={subtitle.language}
                src={subtitle.url}
                default={index === 0}
              />
            ))}
        </>
      ),
    };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="tuby-container">
          {this.props.renderer ? (
            this.props.renderer(this.playerRef, this.videoProps)
          ) : (
            <video ref={this.playerRef} {...this.videoProps} />
          )}
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}

export default ErrorBoundary;

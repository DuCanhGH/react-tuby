import React, { type FC } from "react";
import ClientRender from "./components/ClientRender";
import ErrorBoundary from "./components/ErrorBoundary";
import Main from "./components/Main";
import type { PlayerProps } from "./shared/types";

export const Player: FC<PlayerProps> = (props) => {
  const { dimensions, primaryColor, children, subtitles, src } = props;
  return (
    <div
      className="tuby"
      style={{
        ...(typeof dimensions === "number"
          ? { width: "100%", height: 0, paddingBottom: `${dimensions}%` }
          : typeof dimensions === "object"
          ? {
              width: dimensions.width,
              height: dimensions.height,
            }
          : { width: "100%", height: 0, paddingBottom: "56.25%" }),
        ...(primaryColor
          ? {
              ["--tuby-primary-color"]: primaryColor,
            }
          : {}),
      }}
    >
      <ClientRender>
        <ErrorBoundary renderer={children} src={src} subtitles={subtitles}>
          <Main {...props} />
        </ErrorBoundary>
      </ClientRender>
    </div>
  );
};

export type { PlayerProps } from "./shared/types";

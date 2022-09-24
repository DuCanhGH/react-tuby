import React, { useEffect, useRef } from "react";
import type { FC, RefObject, ReactElement } from "react";

interface ClickAwayListenerProps {
  onClickAway: () => void;
  children: (ref: RefObject<HTMLDivElement>) => ReactElement;
}

const ClickAwayListener: FC<ClickAwayListenerProps> = ({
  children,
  onClickAway,
}) => {
  const childrenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        childrenRef.current &&
        !childrenRef.current.contains(
          // @ts-expect-error
          e.target
        )
      ) {
        onClickAway();
      }
    };

    window.addEventListener("click", handler);

    return () => window.removeEventListener("click", handler);
  }, [onClickAway]);

  return <>{children(childrenRef)}</>;
};

export default ClickAwayListener;

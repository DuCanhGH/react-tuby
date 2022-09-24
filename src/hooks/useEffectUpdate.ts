import { useEffect, useRef, type DependencyList } from "react";

export const useEffectUpdate = (cb: Function, dependencies: DependencyList) => {
  const updated = useRef(false);
  useEffect(() => {
    if (!updated.current) {
      updated.current = true;
      return;
    }
    cb();
    //eslint-disable-next-line
  }, dependencies);
};

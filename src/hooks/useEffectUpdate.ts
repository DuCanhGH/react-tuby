import { useEffect, useRef, DependencyList } from "react";

export const useEffectUpdate = (cb: Function, dependencies: DependencyList) => {
  const updated = useRef(false);
  useEffect(() => {
    if (!updated.current) {
      updated.current = true;
      return;
    }
    cb();
  }, dependencies);
};

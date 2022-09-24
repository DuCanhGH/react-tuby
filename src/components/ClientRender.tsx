import React, { useEffect, useState } from "react";
import type { FC, ReactElement } from "react";

const ClientRender: FC<{ children: ReactElement }> = ({ children }) => {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    setRendered(true);
  }, []);
  return rendered ? children : <></>;
};

export default ClientRender;

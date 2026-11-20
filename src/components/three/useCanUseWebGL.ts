"use client";

import { useEffect, useState } from "react";

/** `null` until checked on the client, then whether a WebGL context can be created. */
export function useCanUseWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(Boolean(c.getContext("webgl2") ?? c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

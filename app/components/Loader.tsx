"use client";

import { useEffect, useState } from "react";

export function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`loader${hidden ? " hidden" : ""}`} id="loader">
      <div className="loader-ring" />
    </div>
  );
}

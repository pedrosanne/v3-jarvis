import { useEffect, useRef, useState } from "react";
import preloaderAsset from "@/assets/preloader-mobile.mp4.asset.json";

const SESSION_KEY = "jarvis_preloader_shown";

export function MobilePreloader() {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const v = videoRef.current;
    if (!v) return;
    const finish = () => {
      setFade(true);
      window.setTimeout(() => setShow(false), 500);
    };
    v.addEventListener("ended", finish, { once: true });
    v.addEventListener("error", finish, { once: true });
    const t = window.setTimeout(finish, 15000);
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => finish());
    return () => {
      window.clearTimeout(t);
      v.removeEventListener("ended", finish);
      v.removeEventListener("error", finish);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        opacity: fade ? 0 : 1,
        transition: "opacity 500ms ease",
        pointerEvents: fade ? "none" : "auto",
      }}
    >
      <video
        ref={videoRef}
        src={preloaderAsset.url}
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

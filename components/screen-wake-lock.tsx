"use client";

import { useEffect } from "react";

interface ScreenWakeLockProps {
  isRunning: boolean;
}

export function ScreenWakeLock({ isRunning }: ScreenWakeLockProps) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.error("Wake lock request failed:", err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLock !== null) {
        try {
          await wakeLock.release();
          wakeLock = null;
        } catch (err) {
          console.error("Wake lock release failed:", err);
        }
      }
    };

    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isRunning) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isRunning]);

  return null;
}

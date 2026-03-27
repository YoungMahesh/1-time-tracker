import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "1timer — Time Tracker",
    short_name: "1timer",
    description:
      "Track time spent on tasks with sessions and logs, stored locally in IndexedDB.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#262626",
    theme_color: "#262626",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

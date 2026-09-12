import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Collins's Monster Truck Adventures",
  description: "Big wheels, bright colors, and little learning adventures for Collins.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fff8e9" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompassAI - Student Course Policy & AI Navigator",
  description:
    "Student companion app for navigating AI course policies and assignment permissions.",
  openGraph: {
    title: "CompassAI - Student Course Policy & AI Navigator",
    description:
      "Student companion app for navigating AI course policies and assignment permissions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

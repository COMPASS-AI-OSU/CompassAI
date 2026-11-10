import type { Metadata } from "next";
import "./globals.css";
import { VisitBeacon } from "@/components/VisitBeacon";

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

// Picks day or night mode before the page paints, so there's no white flash:
// the sun/moon button's saved choice, otherwise the device's setting.
const themeScript = `(function(){try{var t=localStorage.getItem('compass-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        {/* Saves a "visit" event (launch analytics, no names or emails). */}
        <VisitBeacon />
      </body>
    </html>
  );
}

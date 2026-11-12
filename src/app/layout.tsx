import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Caveat, Fraunces } from "next/font/google";
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

// Notebook look: Atkinson Hyperlegible for reading, Fraunces for headings,
// Caveat for the odd handwritten note. Served from our own site, not from Google.
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600"], variable: "--font-caveat" });

// Picks day or night mode before the page paints, so there's no white flash:
// the sun/moon button's saved choice, otherwise the device's setting.
const themeScript = `(function(){try{var t=localStorage.getItem('compass-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${atkinson.variable} ${fraunces.variable} ${caveat.variable}`}>
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

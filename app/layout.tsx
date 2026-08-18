import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.joinjoinr.com";
const siteName = "JoinJoinr";
const siteDescription =
  "Discover events and book tickets in seconds. Browse concerts, sports, theatre, and festivals near you.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Discover and book event tickets`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} — Discover and book event tickets`,
    description: siteDescription,
    images: [{ url: "/logo.jpeg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Discover and book event tickets`,
    description: siteDescription,
    images: ["/logo.jpeg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

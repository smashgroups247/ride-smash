import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ride Smash Surveys",
  description:
    "Survey platform for Ride Smash, designed to collect feedback from both drivers and passengers to improve service quality, safety, and overall user experience.",
  keywords: [
    "Ride Smash",
    "survey app",
    "driver feedback",
    "passenger feedback",
    "ride experience",
    "transport surveys",
    "user feedback",
  ],
  authors: [{ name: "Ride Smash" }],
  creator: "Ride Smash",
  applicationName: "Ride Smash Surveys",
  metadataBase: new URL("https://form.ridesmash.com"),
  openGraph: {
    title: "Ride Smash Surveys",
    description:
      "Help improve Ride Smash by sharing your experience as a driver or passenger.",
    url: "https://form.ridesmash.com/driver-survey",
    siteName: "Ride Smash Surveys",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ride Smash Surveys",
    description:
      "Driver and passenger feedback platform for Ride Smash.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

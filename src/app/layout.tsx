import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import SessionClientProvider from "@/components/SessionClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Poker Hands",
  description: "Share and discuss poker hands",
};

function ServiceWorkerRegistration() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("ServiceWorker registration successful");
        })
        .catch((err) => {
          console.log("ServiceWorker registration failed: ", err);
        });
    });
  }
  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionClientProvider>
          <ServiceWorkerRegistration />
          <main className="container mx-auto px-4 pb-16">
            {children}
          </main>
          <Nav />
        </SessionClientProvider>
      </body>
    </html>
  );
}

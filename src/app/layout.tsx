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
  title: "B2 Sport Academy - Where Science Meets Mixed Martial Arts",
  description: "At B2 Sport Academy we provide world-class coaching, inspirational mentors, accountability and an incredible community to help you achieve your fitness goals, train hard and dream big.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=League+Spartan:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}

        {/* Floating WhatsApp Button */}
        <a
          href="https://api.whatsapp.com/send/?phone=905403001434&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile iletişime geç"
          className="fixed right-4 bottom-4 z-50 group"
        >
          <span className="absolute -top-10 right-0 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 text-xs bg-black/80 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
            WhatsApp ile yaz
          </span>
          <span className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-[conic-gradient(at_30%_30%,#25D366_0deg,#128C7E_120deg,#25D366_240deg,#25D366_360deg)] transition-transform duration-200 hover:scale-105">
            <span className="absolute inset-0 rounded-full ring-2 ring-white/10 group-hover:ring-white/20 transition-colors"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-7 h-7 text-white drop-shadow"
              fill="currentColor"
            >
              <path d="M19.11 17.63c-.27-.14-1.58-.78-1.83-.87-.25-.09-.43-.14-.61.14-.18.27-.69.87-.84 1.05-.15.18-.31.2-.58.07-.27-.14-1.12-.42-2.14-1.32-.79-.71-1.32-1.58-1.46-1.85-.15-.27-.02-.41.12-.55.12-.12.26-.31.39-.47.13-.16.17-.27.26-.45.09-.18.04-.34-.02-.48-.06-.14-.59-1.45-.81-1.99-.21-.52-.43-.45-.61-.46-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.72.34-.25.27-.95.92-.95 2.25s.98 2.62 1.12 2.8c.14.18 1.94 2.92 4.7 4.09.66.28 1.17.45 1.56.57.65.21 1.26.18 1.73.11.53-.08 1.58-.66 1.81-1.26.22-.62.22-1.15.16-1.26-.06-.11-.24-.18-.51-.31z"/>
              <path d="M26.6 5.4C23.6 2.4 19.6 1 15.6 1 7.9 1 1.6 7.3 1.6 15c0 2.4.6 4.7 1.8 6.8L1 31l9.5-2.5c1.9 1 4 1.5 6.1 1.5h0c7.7 0 14-6.3 14-14 0-4-1.6-8-4.6-11zM16.6 27.8h0c-2 .0-3.9-.5-5.6-1.4l-.4-.2-5.8 1.5 1.6-5.6-.3-.4c-1.1-1.8-1.6-3.9-1.6-6.1 0-6.4 5.2-11.6 11.6-11.6 3.1 0 6 .1 8.2 2.3 2.2 2.4 3.4 5.4 3.4 8.6 0 6.4-5.2 11.6-11.5 11.6z"/>
            </svg>
            <span className="absolute -z-10 inset-0 rounded-full bg-[#25D366] opacity-30 blur-xl"></span>
          </span>
        </a>
      </body>
    </html>
  );
}

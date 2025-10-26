"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { persistor, store } from "@/redux/store";
import { Toaster } from "react-hot-toast";
import { PersistGate } from "redux-persist/integration/react";
import NextTopLoader from 'nextjs-toploader';
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // // Setup axios interceptors once when app loads
  // useEffect(() => {
  //   setupAxiosInterceptors(store);
  // }, []);

  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ direction: "rtl", textAlign: "right" }} 
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NextTopLoader
              color="#1374ad"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              
              easing="ease"
              speed={200}
              shadow="0 0 10px #2a495b,0 0 5px #2299DD" 
            />
            {/* <Navbar /> */}
            {children}
            {/* <Footer /> */}
          </PersistGate>
          <Toaster position="top-center" />
        </Provider>
      </body>
    </html>
  );
}
import "@/styles/globals.css";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";

import { beVietnamPro, play, playfairDisplay } from '@/styles/fonts';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      {/* Biến font cho token font-body / font-heading / font-brand, dùng được ở mọi trang */}
      <style jsx global>{`
        :root {
          --font-be-vietnam-pro: ${beVietnamPro.style.fontFamily};
          --font-playfair-display: ${playfairDisplay.style.fontFamily};
          --font-play: ${play.style.fontFamily};
        }
      `}</style>
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}

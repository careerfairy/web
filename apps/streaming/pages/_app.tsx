import "@/styles/globals.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { CacheProvider } from "@emotion/react"
import { Poppins } from "next/font/google"

import { ThemeProvider, CssBaseline } from "@mui/material"
import { createEmotionCache, theme } from "@careerfairy/ui"

const poppins = Poppins({
   subsets: ["latin"],
   weight: "400", // or any other available weight
})

const clientSideEmotionCache = createEmotionCache()

export default function App({ Component, pageProps }: AppProps) {
   return (
      <>
         <Head>
            <meta
               name="viewport"
               content="initial-scale=1, width=device-width, maximum-scale=1.0, user-scalable=0" //https://github.com/vercel/next.js/issues/7176
            />
            <title>CareerFairy | Watch live streams. Get hired.</title>
            <link rel="icon" href="/favicon.ico" />
         </Head>
         <CacheProvider value={clientSideEmotionCache}>
            <ThemeProvider theme={theme}>
               <CssBaseline />
               <main className={poppins.className}>
                  {<Component {...pageProps} />}
               </main>
            </ThemeProvider>
         </CacheProvider>
      </>
   )
}

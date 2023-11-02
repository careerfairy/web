import "styles/globals.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { CacheProvider, EmotionCache } from "@emotion/react"
import { Poppins } from "next/font/google"

import { ThemeProvider, CssBaseline } from "@mui/material"
import { createEmotionCache, theme } from "@careerfairy/shared-ui"

export const poppins = Poppins({
   subsets: ["latin"],
   weight: "400", // or any other available weight
})

theme.typography.fontFamily = poppins.style.fontFamily

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export interface MyAppProps extends AppProps {
   emotionCache?: EmotionCache
}

export default function App({
   Component,
   pageProps,
   emotionCache = clientSideEmotionCache,
}: MyAppProps) {
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
         <CacheProvider value={emotionCache}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <ThemeProvider theme={theme}>
               <CssBaseline />
               {<Component {...pageProps} />}
            </ThemeProvider>
         </CacheProvider>
      </>
   )
}

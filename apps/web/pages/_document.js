import * as React from "react"
import Document, { Html, Head, Main, NextScript } from "next/document"
import createEmotionServer from "@emotion/server/create-instance"
import { brandedLightTheme } from "materialUI"
import createEmotionCache from "materialUI/createEmotionCache"

export default class MyDocument extends Document {
   render() {
      return (
         <Html>
            <Head>
               <link rel="preconnect" href="//app.usercentrics.eu" />
               <link rel="preconnect" href="//api.usercentrics.eu" />
               <link
                  rel="preload"
                  href="//app.usercentrics.eu/browser-ui/latest/loader.js"
                  as="script"
               />
               <link
                  rel="apple-touch-icon-precomposed"
                  sizes="57x57"
                  href="/apple-touch-icon-57x57.png"
               />
               <link
                  rel="apple-touch-icon-precomposed"
                  sizes="114x114"
                  href="/apple-touch-icon-114x114.png"
               />
               <link
                  rel="apple-touch-icon-precomposed"
                  sizes="72x72"
                  href="/apple-touch-icon-72x72.png"
               />
               <link
                  rel="apple-touch-icon-precomposed"
                  sizes="144x144"
                  href="/apple-touch-icon-144x144.png"
               />
               <link
                  rel="apple-touch-icon-precomposed"
                  sizes="60x60"
                  href="/apple-touch-icon-60x60.png"
               />
               <link
                  rel="apple-touch-icon-precomposed"
                  sizes="120x120"
                  href="/apple-touch-icon-120x120.png"
               />
               <link
                  rel="apple-touch-icon-precomposed"
                  sizes="76x76"
                  href="/apple-touch-icon-76x76.png"
               />
               <link
                  rel="apple-touch-icon-precomposed"
                  sizes="152x152"
                  href="/apple-touch-icon-152x152.png"
               />
               <link
                  rel="icon"
                  type="image/png"
                  href="/favicon-196x196.png"
                  sizes="196x196"
               />
               <link
                  rel="icon"
                  type="image/png"
                  href="/favicon-96x96.png"
                  sizes="96x96"
               />
               <link
                  rel="icon"
                  type="image/png"
                  href="/favicon-32x32.png"
                  sizes="32x32"
               />
               <link
                  rel="icon"
                  type="image/png"
                  href="/favicon-16x16.png"
                  sizes="16x16"
               />
               <link
                  rel="icon"
                  type="image/png"
                  href="/favicon-128.png"
                  sizes="128x128"
               />
               <link rel="shortcut icon" href="/favicon.ico" />
               <meta
                  name="google-site-verification"
                  content="Do13x1vDwIZFd0puN68OuSW1fZGMnvJlBBfTFwpdMII"
               />
               <meta
                  name="theme-color"
                  content={brandedLightTheme.palette.primary.main}
               />
               <meta name="application-name" content="&nbsp;" />
               <meta name="msapplication-TileColor" content="#FFFFFF" />
               <meta
                  name="msapplication-TileImage"
                  content="/mstile-144x144.png"
               />
               <meta
                  name="msapplication-square70x70logo"
                  content="/mstile-70x70.png"
               />
               <meta
                  name="msapplication-square150x150logo"
                  content="/mstile-150x150.png"
               />
               <meta
                  name="msapplication-wide310x150logo"
                  content="/mstile-310x150.png"
               />
               <meta
                  name="msapplication-square310x310logo"
                  content="/mstile-310x310.png"
               />
               <link
                  href="https://fonts.googleapis.com/css?family=Poppins:400,400i,500,500i,700, 700i|Roboto+Slab|Permanent+Marker"
                  type="text/css"
                  rel="stylesheet"
               />
               {/* 
                  Define the dataLayer array early in the page so that by the time
                  react components run client side, this array is already set
                  Even if we don't load GTM, its okay to have this variable
                 */}
               <script dangerouslySetInnerHTML={dataLayerObj}></script>
               {/* Inject MUI styles first to match with the prepend: true configuration. */}
               {this.props.emotionStyleTags}
            </Head>
            <body>
               <Main />
               <NextScript />
            </body>
         </Html>
      )
   }
}
// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
   // Resolution order
   //
   // On the server:
   // 1. app.getInitialProps
   // 2. page.getInitialProps
   // 3. document.getInitialProps
   // 4. app.render
   // 5. page.render
   // 6. document.render
   //
   // On the server with error:
   // 1. document.getInitialProps
   // 2. app.render
   // 3. page.render
   // 4. document.render
   //
   // On the client
   // 1. app.getInitialProps
   // 2. page.getInitialProps
   // 3. app.render
   // 4. page.render

   const originalRenderPage = ctx.renderPage

   // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
   // However, be aware that it can have global side effects.
   const cache = createEmotionCache()
   const { extractCriticalToChunks } = createEmotionServer(cache)

   ctx.renderPage = () =>
      originalRenderPage({
         enhanceApp: (App) =>
            function EnhanceApp(props) {
               return <App emotionCache={cache} {...props} />
            },
      })

   const initialProps = await Document.getInitialProps(ctx)
   // This is important. It prevents emotion to render invalid HTML.
   // See https://github.com/mui-org/material-ui/issues/26561#issuecomment-855286153
   const emotionStyles = extractCriticalToChunks(initialProps.html)
   const emotionStyleTags = emotionStyles.styles.map((style) => (
      <style
         data-emotion={`${style.key} ${style.ids.join(" ")}`}
         key={style.key}
         // eslint-disable-next-line react/no-danger
         dangerouslySetInnerHTML={{ __html: style.css }}
      />
   ))

   return {
      ...initialProps,
      emotionStyleTags,
   }
}

/**
 * Memoized object
 */
const dataLayerObj = {
   __html: `window.dataLayer = window.dataLayer || []; `,
}

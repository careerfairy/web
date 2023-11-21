import * as React from "react"
import Document, {
   Html,
   Head,
   Main,
   NextScript,
   DocumentContext,
   DocumentInitialProps,
} from "next/document"
import createEmotionServer from "@emotion/server/create-instance"
import { brandedLightTheme } from "materialUI"
import createEmotionCache from "materialUI/createEmotionCache"
import { isEmbedded, isGroupAdminPath, isStreamingPath } from "util/PathUtils"

interface DocumentProps extends DocumentInitialProps {
   emotionStyleTags: React.ReactNode[]
   shouldRunUsercentrics: boolean
   shouldRunGTM: boolean
   usercentricsPreviewMode: boolean
   shouldSuppressUCBanner: boolean
}

export default function MyDocument(props: DocumentProps) {
   return (
      <Html>
         <Head>
            {props.shouldRunUsercentrics && (
               <>
                  <link rel="preconnect" href="//app.usercentrics.eu" />
                  <link rel="preconnect" href="//api.usercentrics.eu" />
                  <link
                     rel="preload"
                     href="//app.usercentrics.eu/browser-ui/latest/loader.js"
                     as="script"
                  />
                  <script
                     id="usercentrics-cmp"
                     src="https://app.usercentrics.eu/browser-ui/latest/loader.js"
                     data-settings-id="T4NAUxIvE2tGD2"
                     // by default uses the live version
                     data-version={
                        props.usercentricsPreviewMode ? "preview" : undefined
                     }
                     async
                  ></script>
               </>
            )}

            {props.shouldSuppressUCBanner && (
               <script
                  type="application/javascript"
                  dangerouslySetInnerHTML={{
                     __html: `var UC_UI_SUPPRESS_CMP_DISPLAY=true;`,
                  }}
               ></script>
            )}

            {props.shouldRunUsercentrics && props.shouldRunGTM && (
               // eslint-disable-next-line @next/next/next-script-for-ga
               <script
                  id="google-analytics"
                  type="text/plain"
                  data-usercentrics="Google Tag Manager"
                  dangerouslySetInnerHTML={{
                     __html: `
;(function (w, d, s, l, i) {
   w[l] = w[l] || []
   w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" })
   var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != "dataLayer" ? "&l=" + l : ""
   j.async = true
   j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl
   f.parentNode.insertBefore(j, f)
})(window, document, "script", "dataLayer", "GTM-P29VCWC")
                  `,
                  }}
               ></script>
            )}
            <link
               rel="preload"
               href="/fonts/subset-Poppins-Regular.woff2"
               as="font"
               type="font/woff2"
               crossOrigin=""
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
            {/* 
                  Define the dataLayer array early in the page so that by the time
                  react components run client side, this array is already set
                  Even if we don't load GTM, its okay to have this variable
                 */}
            <script dangerouslySetInnerHTML={dataLayerObj}></script>
            {/* Inject MUI styles first to match with the prepend: true configuration. */}
            <meta name="emotion-insertion-point" content="" />
            {props.emotionStyleTags}
         </Head>
         <body>
            <Main />
            <NextScript />
         </body>
      </Html>
   )
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async function (
   ctx: DocumentContext
): Promise<DocumentProps> {
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
               // @ts-ignore
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
      shouldRunUsercentrics: shouldRunUsercentrics(ctx),
      shouldRunGTM: shouldRunGTM(ctx),
      usercentricsPreviewMode: Boolean(ctx.query.useUsercentricsDraftVersion),
      shouldSuppressUCBanner: shouldSuppressUCBanner(ctx),
   }
}

function shouldRunUsercentrics(ctx: DocumentContext) {
   // Don't run when developing / tests
   if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
      return false
   }

   /**
    * Don't run on recording sessions & embedded pages
    */
   if (ctx.query.isRecordingWindow || isEmbedded(ctx.pathname)) {
      return false
   }

   /**
    * Disable UC for certain paths
    */
   if (["/terms"].includes(ctx.pathname)) {
      return false
   }

   return true
}

/**
 * Hide the UC banner for certain paths, but still run the UC scripts
 */
function shouldSuppressUCBanner(ctx: DocumentContext) {
   if (["/data-protection"].includes(ctx.pathname)) {
      return true
   }

   return false
}

function shouldRunGTM(ctx: DocumentContext) {
   /**
    * We don't want to run GTM for group admin journeys or livestreams
    */
   if (isGroupAdminPath(ctx.pathname) || isStreamingPath(ctx.pathname)) {
      return false
   }

   return true
}

/**
 * Memoized object
 */
const dataLayerObj = {
   __html: `window.dataLayer = window.dataLayer || []; `,
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path")

// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//    enabled: process.env.ANALYZE === "true",
// });

/** @type {boolean} */
const notProduction = process.env.NODE_ENV !== "production"

/** @type {boolean} */
const isVercelPreview = process.env.VERCEL_ENV === "preview"

/** @type {Record<string, string[]>} */
const csp = {
   "default-src": [
      "'self'",
      "*.crisp.chat",
      "*.crisp.help",
      "*.facebook.com",
      "*.g.doubleclick.net",
      "*.google-analytics.com",
      "*.googleapis.com",
      "*.graphassets.com",
      "*.graphcms.com",
      "*.gstatic.com",
      "*.hotjar.com",
      "*.js.hs-scripts",
      "*.kozco.com",
      "*.merge.dev",
      "*.tiktok.com",
      "*.vitals.vercel-insights.com",
      "*.youtube.com",
      "*.amazonaws.com",
      "blob:",
      "careerfairy-e1fd9.firebaseapp.com",
      "https://ik.imagekit.io",
   ],
   "script-src": [
      "'self'",
      "'unsafe-eval'",
      "'unsafe-inline'",
      "*.usercentrics.eu",
      "*.facebook.net",
      "*.google-analytics.com",
      "*.googleapis.com",
      "*.googletagmanager.com",
      "*.hotjar.com",
      "*.merge.dev",
      "*.tiktok.com",
      "*.vitals.vercel-insights.com",
      "*.youtube.com",
      "apis.google.com",
      "blob:",
      "cdnjs.cloudflare.com",
      "client.crisp.chat",
      "https://optimize.google.com",
      "https://www.google-analytics.com",
      "https://www.googleanalytics.com",
      "https://www.googleoptimize.com",
      "js.hs-analytics.net",
      "js.hs-banner.com",
      "js.hs-scripts.com",
      "js.hsadspixel.net",
      "snap.licdn.com",
      "https://cdn.dreamdata.cloud",
      "https://d3e54v103j8qbb.cloudfront.net",
      "https://assets-global.website-files.com",
      "https://player.vimeo.com",
      "https://f.vimeocdn.com",
      "https://js.stripe.com",
      "https://scripts.simpleanalyticscdn.com", // Google Ads services
      "https://www.googleadservices.com", // Google Ads services
      "https://cdn.prod.website-files.com", // Webflow
      "https://infrd.com",
      "https://infird.com",
      "https://*.infird.com",
   ],
   "style-src": [
      "'self'",
      "https://optimize.google.com",
      "https://fonts.googleapis.com",
      "*.vitals.vercel-insights.com",
      "*.googletagmanager.com",
      "*.googleapis.com",
      "'unsafe-inline'",
      "client.crisp.chat",
      "https://assets-global.website-files.com",
      "https://cdn.prod.website-files.com", // Webflow
      "https://sibforms.com", // Webflow extension
   ],
   "connect-src": [
      "'self'",
      "*.usercentrics.eu",
      "*.agora.io:*",
      "*.algolia.net",
      "*.algolianet.com",
      "*.analytics.google.com",
      "*.careerfairy.io",
      "*.cloudfunctions.net",
      "*.facebook.com",
      "*.g.doubleclick.net",
      "*.google-analytics.com",
      "*.googleapis.com",
      "*.gstatic.com",
      "*.hotjar.com",
      "*.hotjar.io",
      "*.hubapi.com",
      "*.linkedin.oribi.io",
      "*.sd-rtn.com:*",
      "*.sentry.io",
      "*.tiktok.com",
      "data:",
      "js.hs-banner.com",
      "*.crisp.chat",
      "vitals.vercel-insights.com",
      "ws:",
      "wss:",
      "https://noembed.com", // for react-player thumbnail
      "blob:",
      "https://cdn.dreamdata.cloud",
      "https://px.ads.linkedin.com",
      "https://vimeo.com",
      "https://api.stripe.com",
      "https://www.google.com", // Google Ads services
      "https://capig.stape.tech", // Pixel Conversion API Gateway
      "https://www.googletagmanager.com",
      "https://pagead2.googlesyndication.com", // Google Ads
      "https://vimeocdn.com",
      "https://player.vimeo.com",
      "https://overbridgenet.com",
   ],
   "img-src": [
      "'self'",
      "*.ads.linkedin.com",
      "*.googleapis.com",
      "*.usercentrics.eu",
      "blob:",
      "data:",
      "https:",
   ],
   "frame-src": [
      "blob:",
      "https://cdn.merge.dev",
      "https://go.crisp.chat",
      "https://optimize.google.com",
      "https://vars.hotjar.com",
      "https://www.facebook.com",
      "https://www.youtube.com",
      "https://app.usercentrics.eu",
      "https://player.vimeo.com",
      "https://www.careerfairy.io",
      "https://library.careerfairy.io",
      "https://cdn.embedly.com",
      "https://js.stripe.com",
      "https://hooks.stripe.com",
      "https://td.doubleclick.net", // Google Ads services
      "https://www.googletagmanager.com",
      "https://careerfairy-e1fd9.firebaseapp.com",
   ],
   "font-src": [
      "'self'",
      "https://fonts.gstatic.com",
      "https://script.hotjar.com",
      "data:",
      "https://uploads-ssl.webflow.com",
   ],
   "media-src": [
      "'self'",
      "https://media.careerfairy.io",
      "blob:",
      "*.amazonaws.com",
      "careerfairy-e1fd9.firebaseapp.com",
      "*.youtube.com",
      "*.googleapis.com",
      "*.graphassets.com",
   ],
   "worker-src": [
      "'self'", // For Sentry Replay
      "blob:", // For Sentry Replay
   ],
   "child-src": [
      "'self'", // For Sentry Replay
      "blob:", // For Sentry Replay
   ],
   "frame-ancestors": [
      "'self'",
      "https://*.hygraph.com",
      "https://*.ost-sg.ch",
      "https://*.unibas.ch",
      "https://*.talentagent.de",
      "https://*.uniwunder.com",
      "*", // Temporarily keeping this while we gather more domains
   ],
}

if (notProduction) {
   const allowedPorts = [
      "*:3000", // Next.js
      "*:5000", // Hosting
      "*:5001", // Functions
      "*:8080", // Firestore
      "*:9099", // Auth
      "*:9199", // Storage
   ]

   csp["default-src"].push(...allowedPorts)
   csp["connect-src"].push(...allowedPorts, "ws:*") // For WebSocket connections
   csp["img-src"].push(...allowedPorts)
   csp["media-src"].push(...allowedPorts)
}

if (isVercelPreview) {
   csp["default-src"].push("https://vercel.live", "https://assets.vercel.com")
   csp["script-src"].push("https://vercel.live")
   csp["connect-src"].push("https://vercel.live")
   csp["frame-src"].push("https://vercel.live")
}

/** @type {{key: string, value: string}[]} */
const securityHeaders = [
   {
      // prevent careerfairy from being iframed
      key: "X-Frame-Options",
      value: "SAMEORIGIN",
   },
   {
      key: "Content-Security-Policy",
      value:
         Object.entries(csp)
            .map(([key, value]) => `${key} ${value.join(" ")}`)
            .join("; ") + ";",
   },
   {
      key: "Referrer-Policy",
      value: "origin-when-cross-origin",
   },
   {
      key: "X-Content-Type-Options",
      value: "nosniff",
   },
]

/** @type {import('next').NextConfig} */
const moduleExports = {
   env: {
      REACT_APP_FIREBASE_API_KEY: "AIzaSyAMx1wVVxqo4fooh0OMVSeSTOqNKzMbch0",
      REACT_APP_FIREBASE_AUTH_DOMAIN: "careerfairy-e1fd9.firebaseapp.com",
      REACT_APP_FIREBASE_DATABASE_URL:
         "https://careerfairy-e1fd9.firebaseio.com",
      REACT_APP_FIREBASE_PROJECT_ID: "careerfairy-e1fd9",
      REACT_APP_FIREBASE_STORAGE_BUCKET: "careerfairy-e1fd9.appspot.com",
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: "993933306494",
   },

   // Disabling landing pages for now (CF-701)
   redirects: async () => {
      return [
         {
            source: "/landing",
            destination: "/",
            permanent: false,
         },
         {
            source: "/landing/:slug",
            destination: "/",
            permanent: false,
         },
      ]
   },

   headers: async () => {
      return [
         {
            source: "/(.*)",
            headers: securityHeaders,
         },
         {
            source: "/next-livestreams/:groupId/embed",
            // allow embedding iframes on this path
            headers: [
               {
                  key: "X-Frame-Options",
                  value: "",
               },
            ],
         },

         {
            source: "/next-livestreams/embed",
            // allow embedding iframes on this path
            headers: [
               {
                  key: "X-Frame-Options",
                  value: "",
               },
            ],
         },
         {
            source: "/academic-calendar/embed",
            // allow embedding iframes on this path
            headers: [
               {
                  key: "X-Frame-Options",
                  value: "",
               },
            ],
         },
         {
            source: "/next-livestreams/partnership/:partnerSource",
            // allow embedding iframes on this path
            headers: [
               {
                  key: "X-Frame-Options",
                  value: "",
               },
            ],
         },
         {
            source: "/.well-known/apple-app-site-association",
            headers: [
               {
                  key: "Content-Type",
                  value: "application/json",
               },
            ],
         },
      ]
   },
   experimental: {
      externalDir: true,
      esmExternals: false, // fixes issue with [firebase](https://github.com/FirebaseExtended/reactfire/issues/491)
      outputFileTracingRoot: path.join(__dirname, "../../"),
      scrollRestoration: true,
   },
   images: {
      domains: [
         "firebasestorage.googleapis.com",
         "media.graphcms.com",
         "media.graphassets.com",
         "localhost",
         "127.0.0.1",
         "eu-west-2.graphassets.com",
         "icon.horse", // for fetching favicons
      ],
   },
   webpack: (config) => {
      config.module.rules.push({
         test: /\.wav$/,
         loader: "file-loader",
      })
      config.module.rules.push({
         test: /\.svg$/,
         use: ["@svgr/webpack"],
      })

      return config
   },
   eslint: {
      ignoreDuringBuilds: true,
   },
   // this is an open issue on MUI's GitHub: https://github.com/mui/mui-x/issues/9826#issuecomment-1658333978
   transpilePackages: ["@mui/x-charts", "mui-tel-input"],
   // i18n: {
   //    locales: ["en", "de"],
   //    defaultLocale: "en",
   // },
}

// test or development environment
if (notProduction) {
   // add image domains used by faker.js
   moduleExports.images.domains.push("loremflickr.com")
}

/** @type {import('@sentry/nextjs').SentryWebpackPluginOptions} */
const sentryWebpackPluginOptions = {
   // Additional config options for the Sentry Webpack plugin. Keep in mind that
   // the following options are set automatically, and overriding them is not
   // recommended:
   //   release, url, org, project, authToken, configFile, stripPrefix,
   //   urlPrefix, include, ignore

   // Upload a larger set of source maps for prettier stack traces (increases build time)
   widenClientFileUpload: true,

   // Hides source maps from generated client bundles
   hideSourceMaps: true,

   // Automatically tree-shake Sentry logger statements to reduce bundle size
   disableLogger: true,

   silent: true, // Suppresses all logs
   // For all available options, see:
   // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Only use sentry if we're building the app from continuous integration (Vercel)
// This allows us to build the app locally without having a SENTRY_AUTH_TOKEN variable
// which is required for sentry to upload the sourcemaps files
if (process.env.CI && process.env.NODE_ENV === "production") {
   /**
    * withSentryConfig() docs:
    *
    * Automatically call the code in sentry.server.config.js and sentry.client.config.js, at server start up and client
    * page load, respectively. Using withSentryConfig is the only way to guarantee that the SDK is initialized early
    * enough to catch all errors and start performance monitoring.
    * Generate and upload source maps to Sentry, so that your stacktraces contain original, demangled code.
    */
   module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
} else {
   module.exports = moduleExports
}
// Trigger ci

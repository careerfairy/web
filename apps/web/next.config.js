const { withSentryConfig } = require("@sentry/nextjs")

// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//    enabled: process.env.ANALYZE === "true",
// });

const notProduction = process.env.NODE_ENV !== "production"
const isVercelPreview = process.env.VERCEL_ENV === "preview"

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
   ],
   "font-src": [
      "'self'",
      "https://fonts.gstatic.com",
      "https://script.hotjar.com",
   ],
}

if (notProduction) {
   csp["default-src"].push("localhost:*")
   csp["connect-src"].push("localhost:*")
   csp["img-src"].push("localhost:*")
}

if (isVercelPreview) {
   csp["default-src"].push("https://vercel.live", "https://assets.vercel.com")
   csp["script-src"].push("https://vercel.live")
   csp["connect-src"].push("https://vercel.live")
   csp["frame-src"].push("https://vercel.live")
}

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
   eslint: {
      // Since ESLint was introduced a long time after the beginning of the codebase
      // there are a lot of pending errors that need to be fixed first
      // this will ignore eslint during build to allow deploys
      ignoreDuringBuilds: true,
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
      ]
   },
   experimental: {
      externalDir: true,
      esmExternals: false, // fixes issue with [firebase](https://github.com/FirebaseExtended/reactfire/issues/491)
   },
   images: {
      domains: [
         "firebasestorage.googleapis.com",
         "media.graphcms.com",
         "media.graphassets.com",
         "localhost",
      ],
   },
   webpackDevMiddleware: (config) => {
      config.watchOptions = {
         poll: 1000,
         aggregateTimeout: 300,
      }
      return config
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
      // config.module.rules.push({
      //    test: /\.(woff(2)?|ttf)(\?v=\d+\.\d+\.\d+)?$/,
      //    loader: "file-loader",
      // });
      return config
   },
}

// test or development environment
if (notProduction) {
   // add image domains used by faker.js
   moduleExports.images.domains.push("loremflickr.com")
}

const sentryWebpackPluginOptions = {
   // Additional config options for the Sentry Webpack plugin. Keep in mind that
   // the following options are set automatically, and overriding them is not
   // recommended:
   //   release, url, org, project, authToken, configFile, stripPrefix,
   //   urlPrefix, include, ignore

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

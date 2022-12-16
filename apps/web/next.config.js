const { withSentryConfig } = require("@sentry/nextjs")

// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//    enabled: process.env.ANALYZE === "true",
// });

const notProduction = process.env.NODE_ENV !== "production"
const isVercelPreview = process.env.VERCEL_ENV === "preview"

const securityHeaders = [
   // {
   //    key: "X-Frame-Options",
   //    value: "SAMEORIGIN",
   // },
   {
      key: "Content-Security-Policy",
      value:
         `default-src blob: 'self' careerfairy-e1fd9.firebaseapp.com go.crisp.chat careerfairy-support.crisp.help streaming.crisp.help client.crisp.chat *.merge.dev *.graphassets.com *.graphcms.com *.js.hs-scripts *.hotjar.com *.vitals.vercel-insights.com *.googleapis.com calendly.com *.calendly.com *.gstatic.com *.google-analytics.com *.g.doubleclick.net *.kozco.com *.facebook.com *.tiktok.com *.cookiebot.com *.youtube.com ${
            notProduction ? "localhost:*" : ""
         } ${
            isVercelPreview
               ? "https://vercel.live https://assets.vercel.com"
               : ""
         }; ` +
         `script-src blob: 'self' https://optimize.google.com https://www.googleanalytics.com https://www.google-analytics.com https://www.googleoptimize.com *.merge.dev js.hs-banner.com js.hsadspixel.net js.hs-analytics.net js.hs-scripts.com *.hotjar.com *.vitals.vercel-insights.com snap.licdn.com *.googleapis.com *.googletagmanager.com *.cookiebot.com *.google-analytics.com *.facebook.net 'unsafe-inline' 'unsafe-eval' cdnjs.cloudflare.com *.tiktok.com *.youtube.com apis.google.com client.crisp.chat ${
            isVercelPreview ? "https://vercel.live" : ""
         };` +
         "style-src 'self' https://optimize.google.com https://fonts.googleapis.com *.vitals.vercel-insights.com *.googletagmanager.com *.googleapis.com 'unsafe-inline' client.crisp.chat; " +
         `connect-src data: *.analytics.google.com *.facebook.com *.linkedin.oribi.io *.algolia.net *.algolianet.com js.hs-banner.com *.hotjar.io *.hotjar.com vitals.vercel-insights.com *.careerfairy.io ws: wss: 'self' *.googleapis.com localhost:* *.gstatic.com *.google-analytics.com *.g.doubleclick.net *.cloudfunctions.net *.agora.io:* *.sd-rtn.com:* *.sentry.io *.tiktok.com *.cookiebot.com *.hubapi.com storage.crisp.chat client.crisp.chat ${
            isVercelPreview ? "https://vercel.live" : ""
         };` +
         `img-src https: blob: data: 'self' *.googleapis.com *.calendly.com *.ads.linkedin.com ${
            notProduction ? "localhost:*" : ""
         };` +
         `frame-src blob: https://cdn.merge.dev https://go.crisp.chat https://optimize.google.com https://consentcdn.cookiebot.com https://vars.hotjar.com https://www.facebook.com ${
            isVercelPreview ? "https://vercel.live" : ""
         };` +
         `font-src 'self' https://script.hotjar.com https://fonts.gstatic.com;`,
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

const iFrameSecurityHeaders = [
   {
      key: "X-Frame-Options",
      value: "",
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
            headers: iFrameSecurityHeaders,
         },
      ]
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
   webpack: (config, { dev }) => {
      /**
       * Reduce .next/cache folder size
       *
       * https://webpack.js.org/plugins/split-chunks-plugin/
       * Taken from https://github.com/vercel/next.js/discussions/17218#discussioncomment-4381152
       */
      if (dev) {
         config.optimization.splitChunks = {
            cacheGroups: {
               framework: {
                  chunks: "all",
                  test: /[\\/]node_modules[\\/]/,
                  name: "framework",
                  enforce: true,
               },
            },
         }
      }

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

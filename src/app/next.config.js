"use strict";
const withBundleAnalyzer = require("@next/bundle-analyzer")({
   enabled: process.env.ANALYZE === "true",
});

const {
   PHASE_DEVELOPMENT_SERVER,
   PHASE_PRODUCTION_BUILD,
} = require("next/constants");

const securityHeaders = [
   {
      key: "X-Frame-Options",
      value: "SAMEORIGIN",
   },
   {
      key: "Content-Security-Policy",
      value:
         "default-src 'self' *.googleapis.com *.gstatic.com *.google-analytics.com *.g.doubleclick.net; script-src 'self' *.googleapis.com *.googletagmanager.com *.google-analytics.com 'unsafe-eval' 'unsafe-inline' ; style-src 'self' *.googleapis.com 'unsafe-inline'; connect-src 'self' wss: *.googleapis.com *.gstatic.com *.google-analytics.com *.g.doubleclick.net *.cloudfunctions.net *.agora.io:* *.sd-rtn.com:*",
   },
   {
      key: "Referrer-Policy",
      value: "origin-when-cross-origin",
   },
   {
      key: "X-Content-Type-Options",
      value: "nosniff",
   },
];

const iFrameSecurityHeaders = [
   {
      key: "X-Frame-Options",
      value: "",
   },
];

module.exports = (phase, { defaultConfig }) => {
   //console.log("-> phase", phase);
   const config = {
      env: {
         REACT_APP_FIREBASE_API_KEY: "AIzaSyAMx1wVVxqo4fooh0OMVSeSTOqNKzMbch0",
         REACT_APP_FIREBASE_AUTH_DOMAIN: "careerfairy-e1fd9.firebaseapp.com",
         REACT_APP_FIREBASE_DATABASE_URL:
            "https://careerfairy-e1fd9.firebaseio.com",
         REACT_APP_FIREBASE_PROJECT_ID: "careerfairy-e1fd9",
         REACT_APP_FIREBASE_STORAGE_BUCKET: "careerfairy-e1fd9.appspot.com",
         REACT_APP_FIREBASE_MESSAGING_SENDER_ID: "993933306494",
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
         ];
      },
      webpackDevMiddleware: (config) => {
         config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
         };
         return config;
      },
      webpack: (config) => {
         config.module.rules.push({
            test: /\.wav$/,
            loader: "file-loader",
         });
         config.module.rules.push({
            test: /\.svg$/,
            issuer: {
               test: /\.(js|ts)x?$/,
            },
            use: ["@svgr/webpack"],
         });
         return config;
      },
   };
   // Only uncomment if you want to host build on firebase, keep commented out if hosting on Vercel
   // if (phase === PHASE_PRODUCTION_BUILD) {
   //     config.distDir = '../../dist/client'
   // }
   /* config options for all phases except development here */
   return withBundleAnalyzer(config);
};

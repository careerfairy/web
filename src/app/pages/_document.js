import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheets } from "@material-ui/core/styles";

export default class CustomDocument extends Document {
   render() {
      return (
         <Html>
            <Head>
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
                  rel="stylesheet"
                  type="text/css"
                  href="https://fonts.googleapis.com/css?family=Poppins:400,400i,500,500i,700, 700i|Roboto+Slab|Permanent+Marker"
               />
            </Head>
            <body>
               <Main />
               <NextScript />
            </body>
         </Html>
      );
   }
}
CustomDocument.getInitialProps = async (ctx) => {
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

   // Render app and page and get the context of the page with collected side effects.
   const sheets = new ServerStyleSheets();
   const originalRenderPage = ctx.renderPage;

   ctx.renderPage = () =>
      originalRenderPage({
         enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
      });

   const initialProps = await Document.getInitialProps(ctx);

   return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [
         ...React.Children.toArray(initialProps.styles),
         sheets.getStyleElement(),
      ],
   };
};

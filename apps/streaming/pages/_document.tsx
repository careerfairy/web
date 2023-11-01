import { theme } from "@careerfairy/ui"
import { Html, Head, Main, NextScript } from "next/document"
import { getInitColorSchemeScript } from "@mui/material/styles"

export default function Document() {
   return (
      <Html lang="en" data-color-scheme="light">
         <Head>
            <meta name="theme-color" content={theme.palette.primary.main} />
         </Head>
         <body>
            {getInitColorSchemeScript()}
            <Main />
            <NextScript />
         </body>
      </Html>
   )
}

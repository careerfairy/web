import { Poppins } from "next/font/google"
import { createTheme, Theme } from "@mui/material/styles"

import { theme as baseTheme } from "@careerfairy/shared-ui"

export const poppins = Poppins({
   subsets: ["latin"],
   weight: ["300", "400", "500", "600", "700"],
})

export const theme: Theme = createTheme({
   ...baseTheme,
   typography: {
      ...baseTheme.typography,
      fontFamily: poppins.style.fontFamily,
   },
})

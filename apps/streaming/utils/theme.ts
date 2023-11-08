import { Poppins } from "next/font/google"
import { createTheme } from "@mui/material/styles"

import { themeOptions } from "@careerfairy/shared-ui"

export const poppins = Poppins({
   subsets: ["latin"],
   weight: ["300", "400", "500", "600", "700", "800", "900"],
   style: ["normal", "italic"],
   fallback: ["sans-serif"],
   display: "swap",
})

themeOptions.typography.fontFamily = poppins.style.fontFamily

export const theme = createTheme(themeOptions)

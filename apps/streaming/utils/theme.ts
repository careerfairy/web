import { Poppins } from "next/font/google"

import { createBrandedTheme } from "@careerfairy/shared-ui"

export const poppins = Poppins({
   subsets: ["latin"],
   weight: ["300", "400", "500", "600", "700", "800", "900"],
   style: ["normal", "italic"],
   fallback: ["sans-serif"],
   display: "swap",
})

export const theme = createBrandedTheme({
   mode: "light",
   fontFamily: poppins.style.fontFamily,
})

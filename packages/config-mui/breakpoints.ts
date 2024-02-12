import { ThemeOptions } from "@mui/material/styles"

export const breakpoints = {
   values: {
      // default
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1280,
      xl: 1920,
      // added
      mobile: 768,
      tablet: 1023,
      desktop: 1920,
      sparksFullscreen: 989,
   },
} satisfies ThemeOptions["breakpoints"]

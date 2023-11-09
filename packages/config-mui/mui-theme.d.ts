/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { PaletteColor, PaletteColorOptions } from "@mui/material"
import { ColorPartial } from "@mui/material/styles/createPalette"
import { CSSProperties } from "react"

declare module "@mui/material/styles" {
   // Theme
   interface Theme {
      brand: {
         black: ColorPartial
         white: ColorPartial
      }
   }

   interface ThemeOptions {
      brand: {
         black: ColorPartial
         white: ColorPartial
      }
   }

   // Palette
   interface Palette {
      neutral: PaletteColor
   }

   interface PaletteOptions {
      neutral: PaletteColorOptions
   }

   // Typography
   interface TypographyVariants {
      title1: React.CSSProperties
      title2: React.CSSProperties
      medium: React.CSSProperties
      small: React.CSSProperties
      xsmall: React.CSSProperties
   }

   interface TypographyVariantsOptions {
      title1?: React.CSSProperties
      title2?: React.CSSProperties
      medium?: React.CSSProperties
      small?: React.CSSProperties
      xsmall?: React.CSSProperties
   }

   // Breakpoints
   interface BreakpointOverrides {
      xs: true
      sm: true
      md: true
      lg: true
      xl: true
      mobile: true
      tablet: true
      desktop: true
   }
}

// Typography
declare module "@mui/material/Typography" {
   interface TypographyPropsVariantOverrides {
      title1: true
      title2: true
      button: false
      medium: true
      small: true
      xsmall: true
   }
}

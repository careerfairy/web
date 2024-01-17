/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface */
import { PaletteColor, PaletteColorOptions } from "@mui/material"
import { ColorPartial } from "@mui/material/styles/createPalette"
import { CSSProperties } from "react"
import { Theme } from "@mui/material/styles"

// Define custom theme props to reduce duplication below
interface CustomThemeProps {
   brand: {
      black: ColorPartial
      white: ColorPartial
      tq: ColorPartial
      purple: ColorPartial
   }

   /**
    * Legacy theme options
    */
   legacy?: {
      boxShadows: {
         // color_y_blur_opacity
         dark_8_25_10: string
         grey_5_15?: string
         dark_12_13?: string
      }
      dropShadows?: {
         // color_y_blur_opacity
         dark_6_12_12?: string
      }
      darkTextShadow?: string
      whiteShadow?: string
      drawerWidth?: { small: string; medium: string }
   }
}

declare module "@mui/styles/defaultTheme" {
   interface DefaultTheme extends Theme {}
}
declare module "@mui/material/styles" {
   // Theme
   interface Theme extends CustomThemeProps {}

   interface ThemeOptions extends CustomThemeProps {}

   // Palette
   interface Palette {
      neutral: PaletteColor
      grey: PaletteColor
      /**
       * Legacy theme options
       */
      navyBlue: PaletteColor
      gold: PaletteColor
      black: PaletteColor
      tertiary: PaletteColor
   }

   interface PaletteOptions {
      neutral: PaletteColorOptions
      grey: PaletteColorOptions
      /**
       * Legacy theme options
       */
      navyBlue: PaletteColorOptions
      gold: PaletteColorOptions
      black: PaletteColorOptions
      tertiary: PaletteColorOptions
   }

   interface PaletteColor {
      /**
       * Legacy theme options
       */
      gradient?: string
   }

   interface SimplePaletteColorOptions {
      /**
       * Legacy theme options
       */
      gradient?: string
   }

   // Typography
   interface TypographyVariants {
      medium: React.CSSProperties
      small: React.CSSProperties
      xsmall: React.CSSProperties
      brandedH1: React.CSSProperties
      brandedH2: React.CSSProperties
      brandedH3: React.CSSProperties
      brandedH4: React.CSSProperties
      brandedH5: React.CSSProperties
   }

   interface TypographyVariantsOptions {
      medium?: React.CSSProperties
      small?: React.CSSProperties
      xsmall?: React.CSSProperties
      brandedH1?: React.CSSProperties
      brandedH2?: React.CSSProperties
      brandedH3?: React.CSSProperties
      brandedH4?: React.CSSProperties
      brandedH5?: React.CSSProperties
   }

   // Breakpoints
   interface BreakpointOverrides {
      xs: true
      sm: true
      md: true
      lg: true
      xl: true
      /**
       * Custom breakpoints
       */
      mobile: true
      tablet: true
      desktop: true
      sparksFullscreen: true // adds the breakpoint for the sparks feed
   }
}

declare module "@mui/material" {
   interface Color {
      /**
       * Legacy theme options
       */
      main: string
      dark: string
   }

   interface Transition {
      long: number // Not used?
   }
}

// Typography
declare module "@mui/material/Typography" {
   interface TypographyPropsVariantOverrides {
      button: false
      medium: true
      small: true
      xsmall: true
      brandedH1: true
      brandedH2: true
      brandedH3: true
      brandedH4: true
      brandedH5: true
   }
}

// Button
declare module "@mui/material/Button" {
   interface ButtonPropsColorOverrides {
      grey: true
      gold: true
      black: true
      navyBlue: true
   }
}

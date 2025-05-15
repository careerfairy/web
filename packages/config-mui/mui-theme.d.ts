/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface */
import { PaletteColorOptions } from "@mui/material"
import { Theme } from "@mui/material/styles"
import { ColorPartial } from "@mui/material/styles/createPalette"

// Define custom theme props to reduce duplication below
interface CustomThemeProps {
   brand: {
      black: ColorPartial
      white: ColorPartial
      tq: ColorPartial
      purple: ColorPartial
      info: ColorPartial
      success: ColorPartial
      warning: ColorPartial
      error: ColorPartial
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
      mobileBrandedH1: React.CSSProperties
      desktopBrandedH1: React.CSSProperties
      mobileBrandedH2: React.CSSProperties
      desktopBrandedH2: React.CSSProperties
      mobileBrandedH3: React.CSSProperties
      desktopBrandedH3: React.CSSProperties
      mobileBrandedH4: React.CSSProperties
      desktopBrandedH4: React.CSSProperties
      desktopBrandedH5: React.CSSProperties
      brandedH1: React.CSSProperties
      brandedH2: React.CSSProperties
      brandedH3: React.CSSProperties
      brandedH4: React.CSSProperties
      brandedH5: React.CSSProperties
      brandedBody: React.CSSProperties
   }

   interface TypographyVariantsOptions {
      medium?: React.CSSProperties
      small?: React.CSSProperties
      xsmall?: React.CSSProperties
      mobileBrandedH1?: React.CSSProperties
      desktopBrandedH1?: React.CSSProperties
      mobileBrandedH2?: React.CSSProperties
      desktopBrandedH2?: React.CSSProperties
      mobileBrandedH3?: React.CSSProperties
      desktopBrandedH3?: React.CSSProperties
      mobileBrandedH4?: React.CSSProperties
      desktopBrandedH4?: React.CSSProperties
      desktopBrandedH5?: React.CSSProperties
      brandedH1?: React.CSSProperties
      brandedH2?: React.CSSProperties
      brandedH3?: React.CSSProperties
      brandedH4?: React.CSSProperties
      brandedH5?: React.CSSProperties
      brandedBody?: React.CSSProperties
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
      lsCardsGallery: true
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
      mobileBrandedH1: true
      desktopBrandedH1: true
      mobileBrandedH2: true
      desktopBrandedH2: true
      mobileBrandedH3: true
      desktopBrandedH3: true
      mobileBrandedH4: true
      desktopBrandedH4: true
      desktopBrandedH5: true
      brandedH1: true
      brandedH2: true
      brandedH3: true
      brandedH4: true
      brandedH5: true
      brandedBody: true
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

// Badge
declare module "@mui/material/Badge" {
   interface BadgePropsVariantOverrides {
      branded: true
   }
}

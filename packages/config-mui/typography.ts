import { ThemeOptions } from "@mui/material/styles"
import { breakpoints } from "./breakpoints"

const responsiveVariants = {
   mobileBrandedH1: {
      fontSize: "2rem", // 28px
      lineHeight: 1.5,
   },
   desktopBrandedH1: {
      fontSize: "2.71429rem", // 38px
      lineHeight: 1.5,
   },
   mobileBrandedH2: {
      fontSize: "1.71429rem", // 24px
      lineHeight: 1.5,
   },
   desktopBrandedH2: {
      fontSize: "2rem", // 32px
      lineHeight: 1.5,
   },
   mobileBrandedH3: {
      fontSize: "1.42857rem", // 20px
      lineHeight: 1.5,
   },
   desktopBrandedH3: {
      fontSize: "1.7142857143rem", // 24px
      lineHeight: 1.5,
   },
   mobileBrandedH4: {
      fontSize: "1.28571rem", // 18px
      lineHeight: 1.55556,
   },
   desktopBrandedH4: {
      fontSize: "1.42857rem", // 20px
      lineHeight: 1.5,
   },
   desktopBrandedH5: {
      fontSize: "1.28571rem", // 18px
      lineHeight: 1.55556,
   },
} satisfies ThemeOptions["typography"]

export const getTypography = (
   fontFamily: string
): ThemeOptions["typography"] => {
   const desktop = `@media (min-width:${breakpoints.values.md}px)`

   return {
      brandedH1: {
         ...responsiveVariants.mobileBrandedH1,
         [desktop]: responsiveVariants.desktopBrandedH1,
      },
      brandedH2: {
         ...responsiveVariants.mobileBrandedH2,
         [desktop]: responsiveVariants.desktopBrandedH2,
      },
      brandedH3: {
         ...responsiveVariants.mobileBrandedH3,
         [desktop]: responsiveVariants.desktopBrandedH3,
      },
      brandedH4: {
         ...responsiveVariants.mobileBrandedH4,
         [desktop]: responsiveVariants.desktopBrandedH4,
      },
      ...responsiveVariants,
      brandedH5: {
         fontSize: "1.28571rem", // 18px
         lineHeight: 1.55556,
      },
      brandedBody: {
         fontSize: "1.14286rem", // 16px
         lineHeight: 1.5,
      },
      medium: {
         fontSize: "1.14286rem", // 16px
         lineHeight: 1.5,
      },
      small: {
         fontSize: "1rem", // 14px
         lineHeight: 1.71429,
      },
      xsmall: {
         fontSize: "0.85714rem", // 12px
         lineHeight: 1.333333,
      },
      htmlFontSize: 16,
      fontFamily,

      /**
       * Need to apply the letter spacing to all the typography components
       * due to mui not applying the letter spacing to the components when a
       * custom font is used. This is not to break legacy typographies
       * All these values are copied from the default mui theme
       * Issue: https://github.com/mui/material-ui/issues/24889
       */
      h1: {
         letterSpacing: "-0.01562em",
      },
      h2: {
         letterSpacing: "-0.00833em",
      },
      h3: {
         letterSpacing: "0em",
      },
      h4: {
         letterSpacing: "0.00735em",
      },
      h5: {
         letterSpacing: "0em",
      },
      h6: {
         letterSpacing: "0.0075em",
      },
      subtitle1: {
         letterSpacing: "0.00938em",
      },
      subtitle2: {
         letterSpacing: "0.00714em",
      },
      body1: {
         letterSpacing: "0.00938em",
      },
      body2: {
         letterSpacing: "0.01071em",
      },
      button: {
         letterSpacing: "0.02857em",
      },
      caption: {
         letterSpacing: "0.03333em",
      },
      overline: {
         letterSpacing: "0.08333em",
      },
   }
}

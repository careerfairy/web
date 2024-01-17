import { Theme, ThemeOptions } from "@mui/material/styles"

export const getTypography = (theme: Theme): ThemeOptions["typography"] => {
   const desktop = theme.breakpoints.up("md")

   const brandedH5 = {
      fontSize: "1.28571rem", // 18px
      lineHeight: 1.5,
   }

   const brandedH4 = {
      fontSize: "1.28571rem", // 18px
      lineHeight: 1.5,
      [desktop]: {
         fontSize: "1.42857rem", // 20px
      },
   }

   const textMedium = {
      fontSize: "1.14286rem", // 16px
      lineHeight: 1.6875,
      [desktop]: {},
   }

   const textSmall = {
      fontSize: "1rem", // 14px
      lineHeight: 1.71429,
      [desktop]: {},
   }

   return {
      brandedH1: {
         fontSize: "2rem", // 28px
         lineHeight: 1.5,
         [desktop]: {
            fontSize: "2.71429rem", // 38px
         },
      },
      brandedH2: {
         fontSize: "1.71429rem", // 24px
         lineHeight: 1.5,
         [desktop]: {
            fontSize: "2rem", // 32px
         },
      },
      brandedH3: {
         fontSize: "1.42857rem", // 20px
         lineHeight: 1.5,
         [desktop]: {
            fontSize: "1.42857rem", // 20px
         },
      },
      brandedH4,
      brandedH5,

      medium: textMedium,
      small: textSmall,
      xsmall: {
         fontSize: "0.85714rem", // 12px
         lineHeight: 1,
         [desktop]: {},
      },
      subtitle1: brandedH4,
      subtitle2: brandedH5,
      button: {},
      caption: {},
      overline: {},
      fontWeightBold: 700,
      fontWeightMedium: 600,
      fontWeightRegular: 400,
      fontWeightLight: 300,
      htmlFontSize: theme.typography.htmlFontSize,
      fontFamily: theme.typography.fontFamily,
   }
}

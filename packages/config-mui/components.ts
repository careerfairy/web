import { Components, Theme, alpha } from "@mui/material"

export const getComponents = (theme: Theme): Components => ({
   MuiTooltip: {
      defaultProps: {
         arrow: true,
      },
      styleOverrides: {
         tooltip: {
            backgroundColor: "white",
            color: "rgba(0, 0, 0, 0.87)",
            px: 8,
            py: 12,
            borderRadius: 8,
            boxShadow: "0px 8px 25px rgba(33, 32, 32, 0.1)",
            fontSize: "1rem",
         },
         arrow: {
            color: "white",
         },
      },
   },
   MuiButton: {
      variants: [
         {
            props: { size: "small" },
            style: {
               ...theme.typography.small,
               padding: "4px 16px",
               "& svg": {
                  width: 14,
                  height: 14,
                  fontSize: 14,
               },
            },
         },
         {
            props: { size: "medium" },
            style: {
               ...theme.typography.brandedBody,
               padding: "8px 24px",
               "& svg": {
                  width: 18,
                  height: 18,
                  fontSize: 18,
               },
            },
         },
         {
            props: { size: "large" },
            style: {
               ...theme.typography.brandedBody,
               padding: "12px 28px",
               "& svg": {
                  width: 18,
                  height: 18,
                  fontSize: 18,
               },
            },
         },
         {
            // Disabled outlined acts differently to our figma design, this variant fixes it
            props: { disabled: true, variant: "outlined" },
            style: {
               backgroundColor: theme.brand.white[400],
               color: theme.brand.black[600],
               borderColor: "transparent",
               "&:hover,&:focus": {
                  backgroundColor: `${theme.brand.white[400]} !important`,
               },
            },
         },
         {
            props: { variant: "outlined" },
            style: {
               "&:hover,&:focus": {
                  backgroundColor: theme.brand.white[300],
               },
            },
         },
         /**
          * For Outlined Buttons, we need to adjust the padding due to the
          * outlined border(1px) causing the button to be larger
          */
         {
            props: { variant: "outlined", size: "small" },
            style: {
               padding: "3px 15px",
            },
         },
         {
            props: { variant: "outlined", size: "medium" },
            style: {
               padding: "7px 23px",
            },
         },
         {
            props: { variant: "outlined", size: "large" },
            style: {
               padding: "11px 28px",
            },
         },
         {
            props: { variant: "outlined", color: "secondary" },
            style: {
               backgroundColor: theme.brand.white[300],
            },
         },
         {
            props: { variant: "outlined", color: "primary" },
            style: {
               backgroundColor: theme.brand.white[200],
            },
         },
         {
            props: {
               variant: "contained",
               color: "grey",
            },
            style: {
               boxShadow: theme?.legacy?.boxShadows?.grey_5_15,
            },
         },
         {
            props: { variant: "contained", color: "grey" },
            style: {
               boxShadow: theme?.legacy?.boxShadows?.grey_5_15,
               color: "#4D4D4D", //
            },
         },
         {
            props: { variant: "outlined", color: "grey" },
            style: {
               color:
                  theme.palette.mode === "light"
                     ? // @ts-ignore
                       theme.palette.neutral[500]
                     : theme.palette.text.primary,
               borderColor:
                  theme.palette.mode === "light"
                     ? // @ts-ignore
                       theme.palette.neutral[200]
                     : "rgba(255, 255, 255, 0.23)",
               "&.Mui-disabled": {
                  border: `1px solid ${theme.palette.action.disabledBackground}`,
               },
               "&:hover": {
                  borderColor:
                     theme.palette.mode === "light"
                        ? "rgba(0, 0, 0, 0.23)"
                        : "rgba(255, 255, 255, 0.23)",
                  backgroundColor: alpha(
                     theme.palette.text.primary,
                     theme.palette.action.hoverOpacity
                  ),
               },
            },
         },
         {
            props: { color: "grey", variant: "text" },
            style: {
               color: "#8E8E8E",
               backgroundColor: "transparent",
               "&:hover": {
                  backgroundColor: alpha(
                     theme.palette.text.primary,
                     theme.palette.action.hoverOpacity
                  ),
               },
            },
         },
         {
            props: { color: "black", variant: "contained" },
            style: {
               boxShadow: "none",
               backgroundColor: theme.palette.text.primary,
               color: theme.palette.primary.main,
            },
         },
         {
            props: { color: "navyBlue", variant: "contained" },
            style: {
               boxShadow: "none",
               backgroundColor: theme.palette.navyBlue.main,
               color: "#D5F6F1",
            },
         },
      ],
      styleOverrides: {
         root: {
            borderRadius: 100,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 400,
         },
      },
      defaultProps: {
         disableElevation: true,
      },
   },
   MuiDialog: {
      styleOverrides: {
         paper: {
            borderRadius: 20,
            boxShadow: "none",
         },
         paperFullScreen: {
            borderRadius: 0,
         },
         root: {
            "& .MuiBackdrop-root": {
               backgroundColor: alpha(theme.palette.common.black, 0.2),
            },
         },
      },
   },
   MuiOutlinedInput: {
      styleOverrides: {
         root: {
            borderRadius: 8,
         },
      },
   },
   MuiTextField: {
      styleOverrides: {
         root: {
            "&.registrationInput": {
               backgroundColor: theme.palette.common.white,
               boxShadow: theme?.legacy?.boxShadows?.grey_5_15,
               borderRadius: "8px",

               "& fieldset": {
                  borderRadius: "8px",
                  border: 0,
               },
               "& .Mui-focused fieldset": {
                  border: "2px solid",
                  borderColor: theme.palette.primary.main,
               },
               "& .Mui-error fieldset": {
                  border: "2px solid",
                  borderColor: theme.palette.error.main,
               },
            },
            "&.streamFormInput": {
               borderRadius: "8px",

               "& fieldset": {
                  borderRadius: "8px",
               },
               "& .Mui-focused fieldset": {
                  border: "2px solid",
                  borderColor: theme.palette.secondary.main,
               },
               "& .Mui-error fieldset": {
                  border: "2px solid",
                  borderColor: theme.palette.error.main,
               },
            },
            "&.multiLineInput": {
               "& fieldset": {
                  minHeight: "100px",
                  textAlign: "start",
               },
            },
         },
      },
   },
   MuiFormControl: {
      styleOverrides: {
         root: {
            ".registrationDropdown": {
               backgroundColor: theme.palette.common.white,
               boxShadow: theme?.legacy?.boxShadows?.grey_5_15,
               borderRadius: "8px",

               "& fieldset": {
                  borderRadius: "8px",
                  border: 0,
               },
            },

            "&.marketingForm": {
               borderRadius: "8px",

               "& input": {
                  color: "white",
               },
               "& label": {
                  color: "white",
               },
               "& fieldset": {
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "white",
               },
               "& svg": {
                  color: "white",
               },
               "& div": {
                  color: "white",
               },
            },

            "& .Mui-focused fieldset": {
               border: "2px solid",
               borderColor: theme.palette.primary.main,
            },
            "& .Mui-error fieldset": {
               border: "2px solid",
               borderColor: theme.palette.error.main,
            },
         },
      },
   },
   MuiButtonGroup: {
      styleOverrides: {
         root: {
            borderRadius: 30,
         },
      },
   },
   MuiChip: {
      styleOverrides: {
         label: {
            fontWeight: 500,
            fontSize: "1rem",
         },
         root: ({ stacked }) => ({
            ...(stacked ? { margin: "0.5em 0.5em 0 0" } : {}),
            "&.stacked": {
               margin: "0.5em 0.5em 0 0",
            },
         }),
      },
   },
   MuiCard: {
      styleOverrides: {
         root: {
            borderRadius: 10,
            boxShadow: theme?.legacy?.boxShadows?.dark_8_25_10,
         },
      },
      variants: [
         {
            props: {
               elevation: 0,
            },
            style: {
               boxShadow: "none",
            },
         },
      ],
   },
   MuiPopover: {
      styleOverrides: {
         paper: {
            filter: theme?.legacy?.dropShadows?.dark_6_12_12,
            boxShadow: "none",
            borderRadius: 8,
         },
      },
   },
   MuiFab: {
      styleOverrides: {
         root: {
            filter: theme?.legacy?.dropShadows?.dark_6_12_12,
            boxShadow: "none",
         },
      },
   },
})

import React from "react"
import { Box } from "@mui/material"
import {
   alternateStudentBackground,
   pillsBackgroundTransparent,
} from "../../constants/images"
import { keyframes } from "@mui/material/styles"

const styles = {
   globalBackgroundStyles: {
      height: "100%",
      minHeight: "100vh",
      backgroundColor: (theme) =>
         theme.palette.mode === "dark"
            ? "background.default"
            : "rgb(250,250,250)",
   },
   greyBackgroundStyles: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: (theme) =>
         theme.palette.mode === "dark"
            ? "background.default"
            : "rgb(230,230,230)",
      height: "100%",
      minHeight: "100vh",
   },
   darkBackgroundStyles: {
      backgroundColor: "rgb(44, 66, 81)",
      minHeight: "100%",
   },
   mobileBackgroundStyles: {
      backgroundColor: "rgb(250,250,250)",
      height: "100%",
   },
   tealBackgroundStyles: {
      backgroundColor: "primary.main",
      height: "100%",
      minHeight: "100vh",
      padding: "0 0 40px 0",
      display: "flex",
      flexDirection: "column",
   },
   themedBackgroundStyles: {
      backgroundColor: "primary.main",
      height: "100%",
      minHeight: "100vh",
      padding: "0 0 40px 0",
   },
   darkThemedBackgroundStyles: {
      backgroundColor: "primary.dark",
      height: "100%",
      minHeight: "100vh",
      padding: "0 0 40px 0",
      display: "flex",
      flexDirection: "column",
   },
   paperBackground: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "background.paper",
      height: "100%",
   },
   pillsBackground: ({
      isOnDialog = false,
      isSmallBackground = false,
      bgColor = "",
   }) => ({
      height: "100%",
      background: (theme) =>
         bgColor
            ? `url(${pillsBackgroundTransparent}) top left no-repeat, ${bgColor}`
            : `url(${alternateStudentBackground}) top left no-repeat, ${theme.palette.common.white}`,
      backgroundSize: `auto ${
         isOnDialog ? "60vh" : isSmallBackground ? "40vh" : "120vh"
      }, auto 100vh !important`,
   }),
}

export const GlobalBackground = ({ ...props }) => {
   return <Box sx={styles.globalBackgroundStyles} {...props} />
}

export const GreyBackground = ({ ...props }) => {
   return <Box sx={styles.greyBackgroundStyles} {...props} />
}

export const DarkBackground = ({ ...props }) => {
   return <Box sx={styles.darkBackgroundStyles} {...props} />
}

export const MobileBackground = ({ ...props }) => {
   return <Box sx={styles.mobileBackgroundStyles} {...props} />
}

export const TealBackground = ({ ...props }) => {
   return <Box sx={styles.tealBackgroundStyles} {...props} />
}
export const DarkThemedBackground = ({ ...props }) => {
   return <Box sx={styles.darkThemedBackgroundStyles} {...props} />
}

export const PaperBackground = ({ ...props }) => {
   return <Box sx={styles.paperBackground} {...props} />
}

export const PillsBackground = ({ ...props }) => {
   return (
      <Box
         sx={[
            styles.pillsBackground({
               isOnDialog: props?.isOnDialog,
               isSmallBackground: props?.isSmallBackground,
               bgColor: props?.bgColor,
            }),
            props?.styles,
         ]}
         minHeight={props?.minHeight || "100vh"}
         {...props}
      />
   )
}

export const gradientAnimation = keyframes({
   "0%": { backgroundPosition: "0% 100%" },
   "50%": { backgroundPosition: "100% 0%" },
   "100%": { backgroundPosition: "0% 50%" },
})

export const boxShadowAnimation = keyframes({
   "0%": { boxShadow: "0px 0px 0px 4px #e9911d" },
   "50%": { boxShadow: "0px 0px 0px 4px #dc2743" },
   "100%": { boxShadow: "0px 0px 0px 4px #e9911d" },
})

import { sxStyles } from "../../../../../../types/commonTypes"
import { tooltipClasses } from "@mui/material"

const styles = sxStyles({
   btn: {
      maxWidth: 572,
      boxShadow: "none",
      "&:disabled": {
         backgroundColor: "#E8E8E8",
         color: "#999999",
      },
      textTransform: "none",
      transition: (theme) => theme.transitions.create(["opacity"]),
   },
   hiddenButton: {
      height: 0,
      opacity: 0,
      padding: "0px !important",
      position: "absolute",
   },
   blackText: {
      color: "text.primary",
   },
   whiteText: {
      color: "info.main",
   },
   subButtonText: {
      textAlign: "center",
      marginTop: 2,
      display: "flex",
      justifyContent: "center",
   },
   link: {
      mt: {
         xs: 1.5,
         sm: 2,
      },
      "& a": {
         textDecoration: "underline",
         color: "info.main",
      },
   },
   darkText: {
      color: "#464646",
   },
   darkLinkColor: {
      "& a": {
         color: "#464646",
      },
   },
   toolTip: {
      [`& .${tooltipClasses.tooltip}`]: {
         backgroundColor: "white",
         color: "rgba(0, 0, 0, 0.87)",
         fontSize: "0.92rem",
         px: 1,
         py: 1.5,
         borderRadius: 2,
         boxShadow: (theme) => theme.boxShadows.dark_8_25_10,
      },
      [`& .${tooltipClasses.arrow}`]: {
         color: "white",
      },
   },
   successButton: {
      backgroundColor: (theme) => `${theme.palette.success.main} !important`,
      color: (theme) => `${theme.palette.common.white} !important`,
   },
   btnWrapper: {
      width: "100%",
      maxWidth: 572,
   },
   floatingBtnWrapper: {
      overflow: "hidden",
      borderRadius: [0, 0, 4, 4],
      position: "fixed",
      p: 2,
      bottom: 0,
      maxWidth: {
         xs: "100%",
         md: "minmax(100%, 572px)",
      },
      width: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",

      "&::before": {
         content: '""',
         position: "absolute",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
         background: {
            xs: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)",
            md: `radial-gradient(circle at bottom, rgba(255, 255, 255, 1) 26%, rgba(255, 255, 255, 0) 87%)`,
         },
         borderRadius: [0, 0, 4, 4],
         zIndex: -1,
      },

      "@keyframes fadeIn": {
         from: { opacity: 0 },
         to: { opacity: 1 },
      },

      animation: "fadeIn 0.5s ease-in",
   },
   noMarginTop: {
      mt: "0px !important",
   },
   actionButtonSkeleton: {
      borderRadius: 8,
   },
})

export default styles

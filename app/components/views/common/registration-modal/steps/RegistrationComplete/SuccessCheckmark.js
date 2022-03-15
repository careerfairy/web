import React from "react"
import { alpha } from "@mui/material/styles"

import makeStyles from "@mui/styles/makeStyles"

const useStyles = makeStyles((theme) => ({
   root: {
      width: 180,
      height: 230,
      margin: "0 auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
   },
   checkIcon: {
      width: 160, //
      height: 160,
      position: "relative",
      borderRadius: "50%",
      boxSizing: "content-box",
      border: `8px solid ${theme.palette.common.white}`,
      "&::before": {
         top: 6,
         left: -4,
         width: 60,
         transformOrigin: "100% 50%",
         borderRadius: "100px 0 0 100px",
      },
      "&::after": {
         top: 0,
         left: 60,
         width: 120,
         transformOrigin: "0 50%",
         borderRadius: "0 100px 100px 0",
         animation: "$rotate-circle 4.25s ease-in",
      },
      "&::before, &::after": {
         content: "''",
         height: 200,
         position: "absolute",
         background: "transparent",
         transform: "rotate(-45deg)",
      },
      "& .icon-line": {
         height: 10,
         backgroundColor: theme.palette.common.white,
         display: "block",
         borderRadius: 4,
         position: "absolute",
         zIndex: 10,
         "&.line-tip": {
            top: 92,
            left: 28,
            width: 50,
            transform: "rotate(45deg)",
            animation: "$icon-line-tip 0.75s",
         },
         "&.line-long": {
            top: 76,
            right: 16,
            width: 94,
            transform: "rotate(-45deg)",
            animation: "$icon-line-long 0.75s",
         },
      },
      "& .icon-circle": {
         top: -8,
         left: -8,
         zIndex: 10,
         width: 160,
         height: 160,
         borderRadius: "50%",
         position: "absolute",
         boxSizing: "content-box",
         border: `8px solid ${alpha(theme.palette.common.white, 0.5)}`,
      },
      "& .icon-fix": {
         top: 16,
         width: 10,
         left: 52,
         zIndex: 1,
         height: 170,
         position: "absolute",
         transform: "rotate(-45deg)",
         backgroundColor: "transparent",
      },
   },
   "@keyframes rotate-circle": {
      "0%": { transform: "rotate(-45deg)" },
      "5%": { transform: "rotate(-45deg)" },
      "12%": { transform: "rotate(-405deg)" },
      "100%": { transform: "rotate(-405deg)" },
   },
   "@keyframes icon-line-tip": {
      "0%": { width: 0, left: 2, top: 38 },
      "54%": { width: 0, left: 2, top: 38 },
      "70%": { width: 100, left: -16, top: 74 },
      "84%": { width: 34, left: 42, top: 96 },
      "100%": { width: 50, left: 28, top: 90 },
   },
   "@keyframes icon-line-long": {
      "0%": { width: 0, right: 92, top: 108 },
      "65%": { width: 0, right: 92, top: 108 },
      "84%": { width: 110, right: 0, top: 70 },
      "100%": { width: 94, right: 16, top: 76 },
   },
}))
const SuccessCheckmark = () => {
   const classes = useStyles()
   return (
      <div className={classes.root}>
         <div className={classes.checkIcon}>
            <span className="icon-line line-tip" />
            <span className="icon-line line-long" />
            <div className="icon-circle" />
            <div className="icon-fix" />
         </div>
      </div>
   )
}

export default SuccessCheckmark

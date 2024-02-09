import { Box, BoxProps } from "@mui/material"
import React from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "inherit",
   },
   floatingContent: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      overflow: "hidden",
      zIndex: 2,
   },
})

export const VideoTrackWrapper = ({ ...props }: BoxProps) => {
   return <Box {...props} sx={combineStyles(styles.root, props.sx)} />
}

export const FloatingContent = (props: BoxProps) => {
   return (
      <Box {...props} sx={combineStyles(styles.floatingContent, props.sx)} />
   )
}

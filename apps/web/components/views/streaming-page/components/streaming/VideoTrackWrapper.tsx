import { Box, BoxProps } from "@mui/material"
import React from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: (theme) => theme.transitions.create("border"),
   },
   isSpeaking: {
      border: (theme) => `2.5px solid ${theme.palette.primary.main}`,
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

type VideoTrackWrapperProps = BoxProps & {
   isSpeaking: boolean
}

export const VideoTrackWrapper = ({
   isSpeaking,
   ...props
}: VideoTrackWrapperProps) => {
   return (
      <Box
         {...props}
         sx={combineStyles(
            [styles.root, isSpeaking && styles.isSpeaking],
            props.sx
         )}
      />
   )
}

export const FloatingContent = (props: BoxProps) => {
   return (
      <Box {...props} sx={combineStyles(styles.floatingContent, props.sx)} />
   )
}

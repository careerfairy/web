import { Box, BoxProps } from "@mui/material"
import React from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
})

export const CenteredContainer = (props: BoxProps) => {
   return <Box {...props} sx={combineStyles(styles.root, props.sx)} />
}

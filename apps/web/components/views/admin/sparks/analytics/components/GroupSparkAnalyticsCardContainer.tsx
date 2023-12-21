import React from "react"
import { Box, SxProps } from "@mui/material"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "16px 12px",
   },
})

type GroupSparkAnalyticsCardContainerProps = {
   children: React.ReactNode
   sx?: SxProps
}

export const GroupSparkAnalyticsCardContainer: React.FC<
   GroupSparkAnalyticsCardContainerProps
> = ({ children, sx }) => {
   return <Box sx={combineStyles(styles.root, sx)}>{children}</Box>
}

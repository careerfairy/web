import React from "react"
import { SxProps, Typography } from "@mui/material"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   title: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
      textAlign: "left",
      marginBottom: "21px",
   },
})

type Props = {
   children: React.ReactNode
   sx?: SxProps
}

export const GroupSparkAnalyticsCardContainerTitle: React.FC<Props> = ({
   children,
   sx,
}) => {
   return (
      <Typography sx={combineStyles(styles.title, sx)}>{children}</Typography>
   )
}

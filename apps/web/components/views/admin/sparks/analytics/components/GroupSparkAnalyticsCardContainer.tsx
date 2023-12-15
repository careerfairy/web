import React, { ReactElement } from "react"
import { Box, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "16px 12px",
   },
   title: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
      textAlign: "left",
      marginBottom: "21px",
   },
})

type GroupSparkAnalyticsCardContainerProps = {
   title: string | ReactElement
   children: React.ReactNode
}

export const GroupSparkAnalyticsCardContainer: React.FC<
   GroupSparkAnalyticsCardContainerProps
> = ({ title, children }) => {
   return (
      <Box sx={styles.root}>
         {typeof title === "string" ? (
            <Typography sx={styles.title}>{title}</Typography>
         ) : (
            title
         )}
         {children}
      </Box>
   )
}

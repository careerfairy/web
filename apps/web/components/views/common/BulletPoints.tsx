import { Box, Typography } from "@mui/material"
import React from "react"
import { sxStyles } from "../../../types/commonTypes"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { SystemStyleObject } from "@mui/system"

const styles = sxStyles({
   list: {
      listStyleType: "none",
      pl: 0,
   },
   listItem: {
      display: "list-item",
      position: "relative",
      paddingLeft: 3,
      "&:not(:last-child)": {
         mb: 1,
      },
      "&::before": {
         content: "'\\2022'",
         position: "absolute",
         left: 0,
         color: "primary.main",
         fontSize: "2.5rem",
         lineHeight: "1.3rem",
      },
   },
})
const BulletPoints = ({
   points,
   sx,
}: {
   points: string[]
   sx?: SystemStyleObject<DefaultTheme>
}) => {
   return (
      <Box sx={[styles.list, sx]} component="ul">
         {points.map((point) => (
            <Box sx={styles.listItem} component="li" key={point}>
               <Typography variant="body1" color="black">
                  {point}
               </Typography>
            </Box>
         ))}
      </Box>
   )
}

export default BulletPoints

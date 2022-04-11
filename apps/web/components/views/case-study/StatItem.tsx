import React from "react"
import Box from "@mui/material/Box"
import { StatisticStat } from "../../../types/cmsTypes"
import Typography from "@mui/material/Typography"

const styles = {
   root: {
      paddingTop: 1,
      paddingBottom: 2,
      paddingLeft: 4,
      borderLeft: (theme) => `4px solid ${theme.palette.primary.dark}`,
      color: "primary.dark",
   },
   value: {
      fontWeight: 600,
   },
   label: {},
}
interface Props {
   stat: StatisticStat
}
const StatItem = ({ stat }: Props) => {
   return (
      <Box sx={styles.root}>
         <Typography sx={styles.value} variant={"h2"}>
            {stat.value}
         </Typography>
         <Typography sx={styles.label} variant={"subtitle1"}>
            {stat.label}
         </Typography>
      </Box>
   )
}

export default StatItem

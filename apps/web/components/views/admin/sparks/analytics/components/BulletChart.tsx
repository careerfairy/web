import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import { Box, LinearProgress } from "@mui/material"
import { LinearBarDataPoint } from "@careerfairy/shared-lib/sparks/analytics"

const styles = sxStyles({
   root: {
      display: "grid",
      gridTemplateColumns: {
         xs: "0.55fr 1fr auto",
         md: "0.3fr 1fr auto",
      },
      rowGap: "1em",
      columnGap: "2em",
      alignItems: "center",
   },
   label: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      color: "#5C5C6A",
      fontSize: "16px",
   },
   linearProgress: {
      height: "17px",
      borderRadius: "50px",
      backgroundColor: "#EBEBEF",
      "& .MuiLinearProgress-bar": {
         borderRadius: "50px",
      },
   },
   value: {
      color: "#8E8E8E",
      textAlign: "right",
      fontSize: "12px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      padding: 0,
   },
})

type BulletChartProps = {
   data: LinearBarDataPoint[]
}

const BulletChart: FC<BulletChartProps> = ({ data }) => {
   return (
      <Box sx={styles.root}>
         {data.map((item) => {
            return (
               <>
                  <Box sx={styles.label}>{item.label}</Box>
                  <Box>
                     <LinearProgress
                        variant="determinate"
                        color="secondary"
                        value={item.value}
                        sx={styles.linearProgress}
                     />
                  </Box>
                  <Box sx={styles.value}>{`${item.value} (${Math.round(
                     item.percentage
                  )}%)`}</Box>
               </>
            )
         })}
      </Box>
   )
}

export default BulletChart

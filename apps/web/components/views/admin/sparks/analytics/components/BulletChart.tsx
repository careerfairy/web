import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import { Box, LinearProgress, Typography } from "@mui/material"
import { LinearBarDataPoint } from "@careerfairy/shared-lib/sparks/analytics"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"

const styles = sxStyles({
   root: {
      display: "grid",
      gridTemplateColumns: {
         xs: "1fr",
         md: "0.3fr 1fr auto",
      },
      rowGap: {
         xs: "2em",
         md: "1em",
      },
      columnGap: "2em",
      alignItems: "center",
      "& .BulletChartLabel": {
         color: "#5C5C6A",
         fontSize: "16px",
      },
   },
   labelContainerMobile: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      columnGap: 1,
      marginBottom: "-1.5em",
      justifyContent: "space-between",
      alignItems: "flex-end",
   },
   label: {
      ...getMaxLineStyles(1),
   },
   labelMobile: {
      ...getMaxLineStyles(2),
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
   const isMobile = useIsMobile()
   return (
      <Box sx={styles.root}>
         {data.map((item, index) => {
            const value = `${item.value} (${Math.round(item.percentage)}%)`
            return (
               <>
                  <Box
                     key={`bullet-chart-label-${index}`}
                     sx={Boolean(isMobile) && styles.labelContainerMobile}
                  >
                     <Typography
                        className="BulletChartLabel"
                        sx={isMobile ? styles.labelMobile : styles.label}
                     >
                        {item.label}
                     </Typography>
                     {Boolean(isMobile) && (
                        <Typography sx={styles.value}>{value}</Typography>
                     )}
                  </Box>
                  <Box key={`bullet-chart-${index}`}>
                     <LinearProgress
                        variant="determinate"
                        color="secondary"
                        value={item.percentage}
                        sx={styles.linearProgress}
                     />
                  </Box>
                  {Boolean(!isMobile) && (
                     <Box key={`bullet-chart-value-${index}`} sx={styles.value}>
                        {value}
                     </Box>
                  )}
               </>
            )
         })}
      </Box>
   )
}

export default BulletChart

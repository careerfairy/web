import { Card } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      margin: "15px",
      bgcolor: "#FFFFFF",
      borderRadius: "8px",
      padding: "12px",
      fontWeight: 400,
      color: "#5C5C6A",
   },
   title: {
      fontSize: "14px",
      lineHeight: "24px",
      textAlign: "left",
   },
   wrapper: {
      textAlign: "left",
   },
   value: {
      fontSize: "20px",
      lineHeight: "30px",
      color: "#6749EA",
      marginRight: 3,
      fontWeight: 600,
   },
   label: {
      fontSize: "12px",
      lineHeight: "20px",
   },
})

type CFChartTooltipProps = {
   title: string
   value: string
   label: string
}

const StyledChartTooltip: FC<CFChartTooltipProps> = (
   props: CFChartTooltipProps
) => {
   const { title, value, label } = props

   return (
      <Card sx={styles.root}>
         <div style={styles.title}>{title}</div>
         <div style={styles.wrapper}>
            <span style={styles.value}>{value}</span>
            <span style={styles.label}>{label}</span>
         </div>
      </Card>
   )
}

export default StyledChartTooltip

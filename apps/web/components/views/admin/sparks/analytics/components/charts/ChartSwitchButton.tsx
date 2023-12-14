import { FC } from "react"
import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      borderRadius: "4px",
      width: "200px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 9px 8px 9px",
      cursor: "pointer",
      userSelect: "none",
   },
   active: {
      backgroundColor: "#6749EA",
      color: "#FFFFFF",
   },
   notActive: {
      backgroundColor: "#F6F6FA",
      color: "#6B6B7F",
      border: "1px solid #EEEEEE",
   },
   label: {
      fontWeight: 400,
      fontSize: "16px",
   },
   value: {
      fontWeight: 600,
      fontSize: "20px",
   },
})

type ChartSwitchButtonProps = {
   label: string
   value: string
   active: boolean
   onClick?: () => void
}

const ChartSwitchButton: FC<ChartSwitchButtonProps> = ({
   label,
   value,
   active,
   onClick,
}) => {
   return (
      <Box
         sx={{ ...styles.root, ...(active ? styles.active : styles.notActive) }}
         component={"div"}
         onClick={onClick}
      >
         <span style={styles.label}>{label}</span>
         <span style={styles.value}>{value}</span>
      </Box>
   )
}

export default ChartSwitchButton

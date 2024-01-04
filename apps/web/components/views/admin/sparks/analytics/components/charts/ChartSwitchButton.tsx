import { FC } from "react"
import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const COLORS = {
   ACTIVE_BG_COLOR: "#6749EA",
   ACTIVE_TEXT_COLOR: "#FFFFFF",
   INACTIVE_BG_COLOR: "#F6F6FA",
   INACTIVE_TEXT_COLOR: "#6B6B7F",
   INACTIVE_BORDER_COLOR: "#EEEEEE",
}

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
      backgroundColor: COLORS.ACTIVE_BG_COLOR,
      color: COLORS.ACTIVE_TEXT_COLOR,
   },
   notActive: {
      backgroundColor: COLORS.INACTIVE_BG_COLOR,
      color: COLORS.INACTIVE_TEXT_COLOR,
      border: `1px solid ${COLORS.INACTIVE_BORDER_COLOR}`,
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
   onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
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

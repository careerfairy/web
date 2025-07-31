import { Box, Typography } from "@mui/material"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   infoText: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 400,
      color: "neutral.600",
      whiteSpace: "nowrap",
   },
})

interface TableColumnProps {
   icon: ReactNode
   text: string | number
   width?: number
}

export const TableColumn = ({ icon, text, width }: TableColumnProps) => {
   return (
      <Box sx={[styles.container, width && { width }]}>
         {icon}
         <Typography sx={styles.infoText}>{text}</Typography>
      </Box>
   )
}

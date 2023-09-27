import Chip, { ChipProps } from "@mui/material/Chip"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   chip: {
      display: "flex",
      padding: "4px 4px 4px 12px",
      alignItems: "flex-start",
      gap: "10px",
      borderRadius: "60px",
      background: "#6749EA",
      color: "#FFF",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 600,
      lineHeight: "24px",
      ".MuiChip-deleteIcon": {
         color: "#FFF",
      },
   },
})

const BrandedChip: FC<ChipProps> = ({ ...props }) => (
   <Chip sx={styles.chip} {...props} />
)
export default BrandedChip

import Chip, { ChipProps } from "@mui/material/Chip"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   chip: {
      bgcolor: "secondary.main",
      color: "white",
      fontSize: "1rem",
      fontWeight: 600,
      // margin: "10px 10px 0 0 !important",
      // margin: "10px !important",
      ".MuiChip-deleteIcon": {
         color: "white",
      },
      "& .MuiAutocomplete-tag": {},
   },
})

const BrandedChip: FC<ChipProps> = ({ ...props }) => (
   <Chip sx={styles.chip} {...props} />
)
export default BrandedChip

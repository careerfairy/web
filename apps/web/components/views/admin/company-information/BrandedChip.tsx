import { Chip } from "@mui/material"
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
      lineHeight: "20px",
      ".MuiChip-deleteIcon": {
         color: "#FFF",
      },
   },
})

type Props = {
   label: string
   meta: {
      key: number
      className: string
      disabled: boolean
      "data-tag-index": number
      tabIndex: -1
      onDelete: (event: any) => void
   }
}

const BrandedChip: FC<Props> = ({ label, meta }) => (
   <Chip sx={styles.chip} label={label} {...meta} />
)

export default BrandedChip

import React from "react"
import { Typography } from "@mui/material"
import { Theme, SxProps } from "@mui/material/styles"
import { OverridableStringUnion } from "@mui/types"
import { Variant } from "@mui/material/styles/createTypography"
import { TypographyPropsVariantOverrides } from "@mui/material/Typography/Typography"
import { combineStyles } from "types/commonTypes"

const styles = {
   root: {
      color: "text.secondary",
      fontWeight: 300,
      opacity: 0.3,
   },
} as const

const Heading = ({ sx, children, variant = "h5" }: Props) => {
   return (
      <Typography variant={variant} sx={combineStyles(styles.root, sx)}>
         {children}
      </Typography>
   )
}

interface Props {
   children: React.ReactNode
   sx?: SxProps<Theme>
   variant?: OverridableStringUnion<
      Variant | "inherit",
      TypographyPropsVariantOverrides
   >
}
export default Heading

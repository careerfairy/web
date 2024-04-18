import { IconButton, IconButtonProps } from "@mui/material"
import React from "react"
import { MoreVertical } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      p: 0.2,
      m: -0.2,
      "& svg": {
         width: 24,
         height: 24,
         color: "neutral.700",
      },
   },
})

const BrandedOptions = React.forwardRef<HTMLButtonElement, IconButtonProps>(
   ({ sx, ...props }, ref) => {
      return (
         <IconButton
            ref={ref}
            sx={combineStyles(styles.root, sx)}
            size="small"
            {...props}
         >
            <MoreVertical />
         </IconButton>
      )
   }
)

BrandedOptions.displayName = "BrandedOptions"

export default BrandedOptions

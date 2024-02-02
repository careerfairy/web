import { ButtonBase, ButtonBaseProps, Typography, alpha } from "@mui/material"
import React from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      p: 1.5,
      width: "100%",
      height: "100%",
      bgcolor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.purple[100]}`,
      borderRadius: 2,
      color: "#0000008A",
      "& svg": {
         color: "inherit",
         fontSize: 24,
         width: 24,
         height: 24,
      },
   },
   active: {
      color: "primary.main",
      borderColor: "primary.main",
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
   },
   label: {
      mt: 1.25,
      fontSize: 12,
      color: (theme) => theme.palette.neutral[400],
   },
   labelActive: {
      color: "primary.main",
   },
})

type Props = {
   label: string
   icon: React.ReactNode
   active?: boolean
} & ButtonBaseProps

export const BackgroundModeButton = ({
   label,
   icon,
   active,
   ...rest
}: Props) => {
   return (
      <ButtonBase {...rest} sx={[styles.root, active && styles.active]}>
         {icon}
         <Typography sx={[styles.label, active && styles.labelActive]}>
            {label}
         </Typography>
      </ButtonBase>
   )
}

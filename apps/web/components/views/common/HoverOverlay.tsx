import { Box, type BoxProps, alpha } from "@mui/material"
import Link from "next/link"
import { FC } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   hoverOverlay: (theme) => ({
      position: "absolute",
      inset: 0,
      transition: theme.transitions.create(["opacity"]),
      opacity: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover, &:focus": {
         opacity: 1,
         background: alpha(theme.palette.common.black, 0.4),
      },
      zIndex: 2,
      width: "100%",
      height: "100%",
   }),
})

type Props = {
   icon: React.ReactNode
   href: string
} & BoxProps

const HoverOverlay: FC<Props> = ({ icon, href, sx, ...props }) => {
   return (
      <Box sx={combineStyles(styles.hoverOverlay, sx)} {...props}>
         <Link href={href}>{icon}</Link>
      </Box>
   )
}

export default HoverOverlay

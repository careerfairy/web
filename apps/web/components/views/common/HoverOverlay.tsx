import { Box, Link, SxProps, alpha } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

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
   sx?: SxProps
}

const HoverOverlay: FC<Props> = ({ icon, href, sx }) => {
   return (
      <Box sx={[styles.hoverOverlay, ...(Array.isArray(sx) ? sx : [sx])]}>
         <Link href={href} underline="none">
            {icon}
         </Link>
      </Box>
   )
}

export default HoverOverlay

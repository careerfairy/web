import React from "react"
import { Box, SxProps } from "@mui/material"
import { styled, Theme } from "@mui/material/styles"
import Link from "components/views/common/Link"

const LogoImage = styled("img")({
   cursor: "pointer",
   width: "150px",
   display: "inline-block",
})
export const MainLogo = ({ white, className, sx }: MainLogoProps) => {
   return (
      <Box
         component={Link}
         href="/"
         sx={{
            display: "flex",
         }}
      >
         <LogoImage
            alt="CareerFairy Logo"
            src={white ? "/logo_white.svg" : "/logo_teal.svg"}
            className={className}
            sx={sx}
         />
      </Box>
   )
}

export const MiniLogo = ({ size = 30 }: MiniLogoProps) => {
   return (
      <Link href="/">
         <a>
            <img
               alt="CareerFairy Logo"
               width={size}
               height={size}
               src={"/apple-touch-icon-57x57.png"}
            />
         </a>
      </Link>
   )
}
type MiniLogoProps = {
   size?: number
}
type MainLogoProps = {
   white?: boolean
   sx?: SxProps<Theme>
   className?: string
}

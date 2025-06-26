import { Box, SxProps } from "@mui/material"
import { styled, Theme } from "@mui/material/styles"
import Image from "next/image"
import Link from "next/link"
import { MobileUtils } from "../../util/mobile.utils"

const LogoImage = styled("img")({
   cursor: "pointer",
   width: "150px",
   display: "inline-block",
})
export const MainLogo = ({ white, className, sx }: MainLogoProps) => {
   return (
      <Box
         component={Link}
         href={"/portal"}
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
      <Link href={MobileUtils.webViewPresence() ? "/portal" : "/"}>
         <Image
            alt="CareerFairy Logo"
            width={size}
            height={size}
            src={"/apple-touch-icon-57x57.png"}
         />
      </Link>
   )
}

export const MiniLogoGreenBg = () => {
   return (
      <Image
         width={24}
         height={24}
         style={{
            objectFit: "contain",
            borderRadius: "50%",
         }}
         src={"/logo-green.png"}
         alt={"logo"}
      />
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

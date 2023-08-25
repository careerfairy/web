import React, { useCallback } from "react"
import Stack, { StackProps } from "@mui/material/Stack"
import { alpha, useTheme } from "@mui/material/styles"
import {
   Box,
   IconButton,
   Tooltip,
   Typography,
   useMediaQuery,
} from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import { SocialIconProps } from "../../custom-hook/useSocials"
import Image from "next/image"

const mobileProp = "sm"

interface WidgetButtonProps extends StackProps {
   isImageIcon?: boolean
   iconsColor?: "grey" | "primary" | "secondary"
   noBackgroundColor?: boolean
   iconStyle?: any
   socials: SocialIconProps[]
}

const styles = sxStyles({
   socialIcons: {
      color: "secondary.main",
      width: "100%",
      borderRadius: 2,
      backgroundColor: (theme) => ({
         xs: "transparent",
         [mobileProp]: alpha(theme.palette.grey["400"], 0.1),
      }),
   },
   icon: {
      fontSize: { xs: "2rem", md: "4rem" },
   },
   iconButton: {
      "&:hover": {
         backgroundColor: "transparent",
      },
   },
   socialContainer: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      alignItems: "center",
      "&:hover": {
         cursor: "pointer",
      },
   },
   imageBox: {
      width: "48px",
   },
   iconText: {
      color: "tertiary.dark",
      fontSize: "16px",
      mt: "2px",
   },
})

export const ReferralWidget = ({
   isImageIcon,
   iconsColor = "secondary",
   noBackgroundColor,
   iconStyle,
   socials,
   ...rest
}: WidgetButtonProps) => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down(mobileProp))

   const getIconButton = useCallback(
      (icon) => (
         <Tooltip key={icon.name} arrow title={icon.name}>
            <IconButton
               sx={[
                  styles.iconButton,
                  {
                     color:
                        iconsColor === "grey"
                           ? "common.black"
                           : `${iconsColor}.main`,
                     width: mobile ? "15%" : "unset",
                  },
               ]}
               size={"large"}
               onClick={icon.onClick}
               href={icon.href}
            >
               <icon.icon
                  color={"inherit"}
                  sx={[styles.icon, iconStyle && { ...iconStyle }]}
               />
            </IconButton>
         </Tooltip>
      ),
      [iconStyle, iconsColor, mobile]
   )

   const getImageButton = useCallback(
      (icon) => (
         <Box sx={styles.socialContainer}>
            <Box sx={styles.imageBox} onClick={icon.onClick}>
               <Image
                  src={icon.imageLink}
                  alt={icon.name}
                  objectFit={"contain"}
                  height={100}
                  width={100}
               />
            </Box>
            <Typography sx={styles.iconText}> {icon.name} </Typography>
         </Box>
      ),
      []
   )

   return (
      <Stack
         direction={{ xs: "row", [mobileProp]: "row" }}
         justifyContent={"space-evenly"}
         sx={[
            styles.socialIcons,
            noBackgroundColor && { backgroundColor: "transparent !important" },
         ]}
         spacing={1}
         {...rest}
      >
         {socials.map((icon) =>
            isImageIcon ? getImageButton(icon) : getIconButton(icon)
         )}
      </Stack>
   )
}

export default ReferralWidget

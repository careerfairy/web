import React from "react"
import Stack, { StackProps } from "@mui/material/Stack"
import { alpha, useTheme } from "@mui/material/styles"
import { IconButton, Tooltip, useMediaQuery } from "@mui/material"
import { StylesProps, sxStyles } from "../../../types/commonTypes"
import { SocialIconProps } from "../../custom-hook/useSocials"

const mobileProp = "sm"

interface WidgetButtonProps extends StackProps {
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
})

export const ReferralWidget = ({
   iconsColor = "secondary",
   noBackgroundColor,
   iconStyle,
   socials,
   ...rest
}: WidgetButtonProps) => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down(mobileProp))

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
         {socials.map((icon) => (
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
         ))}
      </Stack>
   )
}

export default ReferralWidget

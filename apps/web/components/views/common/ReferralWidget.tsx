import React from "react"
import Stack, { StackProps } from "@mui/material/Stack"
import { alpha, useTheme } from "@mui/material/styles"
import { IconButton, Tooltip, useMediaQuery } from "@mui/material"
import useSocials from "../../custom-hook/useSocials"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { StylesProps } from "../../../types/commonTypes"
const mobileProp = "sm"

interface WidgetButtonProps extends StackProps {
   event: LivestreamEvent
   iconsColor?: "grey" | "primary" | "secondary"
   noBackgroundColor?: boolean
   iconStyle?: any
}
const styles: StylesProps = {
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
}
export const ReferralWidget = ({
   event,
   iconsColor = "secondary",
   noBackgroundColor,
   iconStyle,
   ...rest
}: WidgetButtonProps) => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down(mobileProp))
   const socials = useSocials(event)

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

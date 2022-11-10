import React from "react"
import Stack, { StackProps } from "@mui/material/Stack"
import { alpha, useTheme } from "@mui/material/styles"
import { Button, IconButton, Tooltip, useMediaQuery } from "@mui/material"
import useSocials from "../../custom-hook/useSocials"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { StylesProps } from "../../../types/commonTypes"
import { Livestream } from "@careerfairy/shared-lib/dist/livestreams/Livestream"
const mobileProp = "sm"

interface WidgetButtonProps extends StackProps {
   event: LivestreamEvent | Livestream
   iconsColor?: "grey" | "primary" | "secondary"
   noBackgroundColor?: boolean
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
      fontSize: "4rem",
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
   ...rest
}: WidgetButtonProps) => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down(mobileProp))
   const socials = useSocials(event)

   return (
      <Stack
         direction={{ xs: "column", [mobileProp]: "row" }}
         justifyContent={"space-evenly"}
         sx={[
            styles.socialIcons,
            noBackgroundColor && { backgroundColor: "transparent !important" },
         ]}
         spacing={1}
         {...rest}
      >
         {socials.map((icon) =>
            mobile ? (
               <Button
                  fullWidth
                  key={icon.name}
                  color={iconsColor}
                  variant={"outlined"}
                  size={"large"}
                  onClick={icon.onClick}
                  href={icon.href}
                  startIcon={<icon.icon />}
               >
                  {icon.name}
               </Button>
            ) : (
               <Tooltip key={icon.name} arrow title={icon.name}>
                  <IconButton
                     sx={[
                        styles.iconButton,
                        {
                           color:
                              iconsColor === "grey"
                                 ? "common.black"
                                 : `${iconsColor}.main`,
                        },
                     ]}
                     size={"large"}
                     onClick={icon.onClick}
                     href={icon.href}
                  >
                     <icon.icon color={"inherit"} sx={styles.icon} />
                  </IconButton>
               </Tooltip>
            )
         )}
      </Stack>
   )
}

export default ReferralWidget

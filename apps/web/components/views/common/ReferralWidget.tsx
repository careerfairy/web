import React from "react"
import { StylesProps } from "types/commonTypes"
import Stack from "@mui/material/Stack"
import {
   Button,
   IconButton,
   Tooltip,
   Typography,
   useMediaQuery,
} from "@mui/material"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import useSocials from "../../custom-hook/useSocials"
import { alpha, useTheme } from "@mui/material/styles"
const mobileProp = "sm"
const styles: StylesProps = {
   root: {
      textAlign: "center",
   },
   socialIcons: {
      color: "secondary.main",
      borderRadius: 2,
      backgroundColor: (theme) => ({
         xs: "transparent",
         [mobileProp]: alpha(theme.palette.grey["400"], 0.1),
      }),
   },
   icon: {
      color: "secondary.main",
      fontSize: "4rem",
   },
   iconButton: {
      "&:hover": {
         backgroundColor: "transparent",
      },
   },
}

interface Props {
   event: LivestreamEvent
   title?: string
   subtitle?: string
}
const ReferralWidget = ({ event, title, subtitle }: Props) => {
   const socials = useSocials(event)
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down(mobileProp))
   return (
      <Stack spacing={2} sx={styles.root}>
         {(title || subtitle) && (
            <span>
               {title && <Typography variant="h6">{title}</Typography>}
               {subtitle && <Typography variant="body1">{subtitle}</Typography>}
            </span>
         )}
         <Stack
            direction={{ xs: "column", [mobileProp]: "row" }}
            justifyContent={"space-evenly"}
            sx={styles.socialIcons}
            spacing={1}
         >
            {socials.map((icon) =>
               mobile ? (
                  <Button
                     fullWidth
                     key={icon.name}
                     color={"secondary"}
                     variant={"outlined"}
                     size={"large"}
                     startIcon={<icon.icon />}
                  >
                     {icon.name}
                  </Button>
               ) : (
                  <Tooltip key={icon.name} arrow title={icon.name}>
                     <IconButton
                        sx={styles.iconButton}
                        onClick={icon.onClick}
                        size={"large"}
                        href={icon.href}
                        color={"secondary"}
                     >
                        <icon.icon sx={styles.icon} />
                     </IconButton>
                  </Tooltip>
               )
            )}
         </Stack>
         <Typography variant="body1">
            <b>Pro tip:</b> By sharing the event your questions will be more
            visible for the event hosts
         </Typography>
      </Stack>
   )
}

export default ReferralWidget

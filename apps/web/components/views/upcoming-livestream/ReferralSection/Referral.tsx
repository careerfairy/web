import React from "react"
import { StylesProps } from "types/commonTypes"
import Stack from "@mui/material/Stack"
import {
   Alert,
   Button,
   IconButton,
   Tooltip,
   Typography,
   useMediaQuery,
} from "@mui/material"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { alpha, useTheme } from "@mui/material/styles"
import useSocials from "../../../custom-hook/useSocials"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import Box from "@mui/material/Box"
const mobileProp = "sm"
const styles: StylesProps = {
   root: {
      textAlign: "center",
      backgroundColor: alpha("#FFF1CC", 0.5),
      borderRadius: 2,
      p: 3,
   },
   sharePrompt: {
      p: 1,
      backgroundColor: "secondary.main",
      color: (theme) =>
         theme.palette.getContrastText(theme.palette.secondary.main),
      width: "fit-content",
      borderRadius: 2,
   },
   socialIcons: {
      color: "secondary.main",
      width: "100%",
   },
   icon: {
      color: (theme) => theme.palette.common.black,
      fontSize: "4rem",
   },
   iconButton: {
      "&:hover": {
         backgroundColor: "transparent",
      },
   },
   alert: {
      backgroundColor: (theme) => theme.palette.grey["200"],
      borderRadius: 2,
      "& svg": {
         color: (theme) => theme.palette.common.black,
      },
   },
}

interface Props {
   event: LivestreamEvent
}
const Referral = ({ event }: Props) => {
   const socials = useSocials(event)
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down(mobileProp))
   return (
      <Stack spacing={2} alignItems={"center"} sx={styles.root}>
         <Box sx={styles.sharePrompt}>
            <Typography variant="h6">SHARE</Typography>
         </Box>
         <Stack
            direction={{ xs: "column", [mobileProp]: "row" }}
            justifyContent={"center"}
            sx={styles.socialIcons}
            spacing={1}
         >
            {socials.map((icon) =>
               mobile ? (
                  <Button
                     fullWidth
                     color={"grey"}
                     variant={"outlined"}
                     size={"large"}
                     startIcon={<icon.icon />}
                  >
                     {icon.name}
                  </Button>
               ) : (
                  <Tooltip arrow title={icon.name}>
                     <IconButton
                        sx={styles.iconButton}
                        onClick={icon.onClick}
                        size={"large"}
                        href={icon.href}
                        color={"default"}
                     >
                        <icon.icon sx={styles.icon} />
                     </IconButton>
                  </Tooltip>
               )
            )}
         </Stack>
         <Alert sx={styles.alert} icon={<InfoIcon />} severity="info">
            Share the event with your network! Your questions will be shown on
            top and answered first!
         </Alert>
      </Stack>
   )
}

export default Referral

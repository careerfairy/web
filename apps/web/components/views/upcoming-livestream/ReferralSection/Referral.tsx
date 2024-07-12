import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { Alert, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import { StylesProps } from "types/commonTypes"
import useEventSocials from "../../../custom-hook/useEventSocials"
import useIsMobile from "../../../custom-hook/useIsMobile"
import ReferralWidget from "../../common/ReferralWidget"

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
   alert: {
      backgroundColor: (theme) => theme.palette.grey["200"],
      borderRadius: 2,
      width: "100%",
      "& svg": {
         color: (theme) => theme.palette.common.black,
      },
   },
}

interface Props {
   event: LivestreamEvent
}
const Referral = ({ event }: Props) => {
   const isMobile = useIsMobile()
   const socials = useEventSocials(event)

   return (
      <Stack spacing={2} alignItems={"center"} sx={styles.root}>
         <Box sx={styles.sharePrompt}>
            <Typography variant="h6">SHARE</Typography>
         </Box>
         <Box width={"100%"}>
            <ReferralWidget
               socials={socials}
               noBackgroundColor
               iconsColor={"grey"}
               justifyContent={"center"}
               iconStyle={{ height: isMobile ? "32px" : "unset", padding: 0 }}
            />
         </Box>
         <Alert sx={styles.alert} icon={<InfoIcon />} severity="info">
            Share the event with your network! Your questions will be shown on
            top and answered first!
         </Alert>
      </Stack>
   )
}

export default Referral

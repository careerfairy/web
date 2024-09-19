import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import { sxStyles } from "../../../../types/commonTypes"
import { makeReferralUrl } from "../../../../util/makeUrls"

import { useCurrentStream } from "../../../../context/stream/StreamContext"
import { useAuth } from "../../../../HOCs/AuthProvider"

import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import Link from "../../common/Link"
import ShareLinkButton from "../../common/ShareLinkButton"
import RecommendedEvents from "../../portal/events-preview/RecommendedEvents"
import ProgressIndicators, {
   ProgressIndicatorsLoader,
} from "./ProgressIndicators"

const styles = sxStyles({
   root: {
      bgcolor: "background.default",
      py: 5,
      height: "inherit",
      alignItems: "center",
      overflow: "auto",
      width: "100%",
   },
   divider: {
      width: 100,
      mx: "auto !important",
      borderColor: "text.secondary",
   },
   ctas: {
      display: "inline-flex",
      justifyContent: "center",
   },
   container: {
      height: "inherit",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
   },
   stack: { width: "100%" },
})

const EndOfStreamView = ({ showRecommendedEvents = true }) => {
   const { currentLivestream } = useCurrentStream()

   const { userPresenter, userData } = useAuth()

   return (
      <Box sx={styles.root}>
         <Container sx={styles.container}>
            <Stack
               spacing={2}
               justifyContent={"space-between"}
               sx={styles.stack}
            >
               <Typography variant={"h6"} fontWeight={400} align={"center"}>
                  Thanks for watching!
               </Typography>
               {Boolean(currentLivestream.title) && (
                  <Box pb={1}>
                     <Typography
                        variant={"h3"}
                        fontWeight={"bolder"}
                        align={"center"}
                     >
                        {currentLivestream.title}
                     </Typography>
                  </Box>
               )}
               {Boolean(userPresenter) && (
                  <SuspenseWithBoundary fallback={<ProgressIndicatorsLoader />}>
                     <ProgressIndicators />
                  </SuspenseWithBoundary>
               )}
               <Box py={1}>
                  <Divider sx={styles.divider} variant="middle" />
               </Box>
               {Boolean(showRecommendedEvents) && (
                  <>
                     <Box>
                        <Typography
                           gutterBottom
                           variant={"h6"}
                           align={"center"}
                        >
                           Recommended live streams for you
                        </Typography>
                        <RecommendedEvents hideTitle />
                     </Box>
                     <Stack
                        alignItems={"center"}
                        spacing={2}
                        justifyContent={"center"}
                     >
                        <Button
                           component={Link}
                           size={"large"}
                           href={"/portal"}
                           variant={"contained"}
                        >
                           SEE MORE LIVE STREAMS
                        </Button>
                        {Boolean(userData?.referralCode) && (
                           <ShareLinkButton
                              size={"large"}
                              linkUrl={makeReferralUrl(userData?.referralCode)}
                           />
                        )}
                     </Stack>
                  </>
               )}
            </Stack>
         </Container>
      </Box>
   )
}

export default EndOfStreamView

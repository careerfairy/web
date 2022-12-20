import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Divider from "@mui/material/Divider"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import React from "react"

import { ResearchBadge } from "@careerfairy/shared-lib/dist/badges/ResearchBadges"
import { NetworkerBadge } from "@careerfairy/shared-lib/dist/badges/NetworkBadges"
import { EngageBadge } from "@careerfairy/shared-lib/dist/badges/EngageBadges"

import { sxStyles } from "../../../../types/commonTypes"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import { useAuth } from "../../../../HOCs/AuthProvider"

import RecommendedEvents from "../../portal/events-preview/RecommendedEvents"
import ShareLinkButton from "../../common/ShareLinkButton"
import Link from "../../common/Link"
import { CircularBadgeProgress } from "./CircularBadgeProgress"
import { getBaseUrl } from "../../../helperFunctions/HelperFunctions"

const styles = sxStyles({
   root: {
      bgcolor: "background.default",
      py: 2,
      height: "inherit",
      alignItems: "center",
      overflow: "auto",
      width: "100%",
   },
   divider: {
      width: 150,
      mx: "auto !important",
      borderWidth: 1,
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

const EndOfStreamView = () => {
   const { currentLivestream } = useCurrentStream()

   const { userPresenter } = useAuth()

   return (
      <Box sx={styles.root}>
         <Container sx={styles.container}>
            <Stack
               spacing={{
                  xs: 2,
                  sm: 4,
               }}
               justifyContent={"space-between"}
               sx={styles.stack}
            >
               <Typography align={"center"}>Thanks for watching!</Typography>
               {currentLivestream.title && (
                  <Typography
                     variant={"h4"}
                     fontWeight={"bolder"}
                     align={"center"}
                  >
                     {currentLivestream.title}
                  </Typography>
               )}
               {userPresenter && (
                  <>
                     <Typography align={"center"}>
                        Congrats! You are one step closer to land the job you’ll
                        love 🚀
                     </Typography>
                     <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        spacing={{
                           xs: 2,
                           sm: 5,
                        }}
                     >
                        <CircularBadgeProgress
                           badge={ResearchBadge}
                           label={"Research"}
                           helperText={
                              "The more you progress through these levels, the more exclusive content you'll have access to."
                           }
                        />
                        <CircularBadgeProgress
                           badge={NetworkerBadge}
                           helperText={
                              "The more you progress through these levels, the easier it will be for you to increase your network."
                           }
                           label={"Network"}
                        />
                        <CircularBadgeProgress
                           label={"Engagement"}
                           badge={EngageBadge}
                           helperText={
                              "The more you progress through these levels, the easier it will be for you to engage with company recruiters."
                           }
                        />
                     </Stack>
                  </>
               )}

               <Divider sx={styles.divider} variant="middle" />
               <Box>
                  <Typography variant={"h6"} align={"center"}>
                     Recommended livestreams for you
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
                  <ShareLinkButton
                     size={"large"}
                     linkUrl={getLinkUrl(currentLivestream.id)}
                  />
               </Stack>
            </Stack>
         </Container>
      </Box>
   )
}

const getLinkUrl = (streamId: string) =>
   `${getBaseUrl()}/upcoming-livestream/${streamId}?utm_source=end_of_stream&utm_medium=share`
export default EndOfStreamView

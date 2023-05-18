import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import {
   getServerSideUserStats,
   getUserTokenFromCookie,
   mapFromServerSide,
} from "../../../util/serverUtil"
import { livestreamRepo } from "../../../data/RepositoryInstances"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import SEO from "../../../components/util/SEO"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"
import NoResultsMessage from "../../../components/views/common/NextLivestreams/NoResultsMessage"
import ScrollToTop from "../../../components/views/common/ScrollToTop"
import React, { useMemo } from "react"
import { StreamsSection } from "components/views/common/NextLivestreams/StreamsSection"
import { Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import DateUtil from "../../../util/DateUtil"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import Link from "../../../components/views/common/Link"
import useIsMobile from "../../../components/custom-hook/useIsMobile"

const styles = sxStyles({
   noResultsMessage: {
      maxWidth: "800px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
      textAlign: "center",
   },
})

const UnlockedContent = ({
   unlockedEvents,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const isMobile = useIsMobile()

   const unlockedPastLivestreams = useMemo(
      () => mapFromServerSide(unlockedEvents),
      [unlockedEvents]
   )

   const noResultsMessage = useMemo<JSX.Element>(
      () => (
         <Grid xs={12} mt={4} mx={1} item>
            <Typography sx={styles.noResultsMessage} variant="h5">
               {/* eslint-disable-next-line react/no-unescaped-entities */}
               {isMobile ? "You" : "Currently you"} don't have any unlocked
               content 😕 <br />
               Check them out <Link href="/past-livestreams">here</Link>
            </Typography>
         </Grid>
      ),
      [isMobile]
   )

   return (
      <>
         <SEO
            id={"CareerFairy | Unlocked content"}
            description={"CareerFairy | Unlocked content"}
            title={"CareerFairy | Unlocked content"}
         />
         <GenericDashboardLayout pageDisplayName={"Unlocked content"}>
            <StreamsSection
               value={"pastEvents"}
               pastLivestreams={unlockedPastLivestreams}
               listenToUpcoming
               minimumUpcomingStreams={0}
               noResultsComponent={
                  <NoResultsMessage message={noResultsMessage} />
               }
            />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   const token = getUserTokenFromCookie(ctx)

   const todayLess5Days = DateUtil.addDaysToDate(new Date(), -5)
   const promises = []

   // only do the logic if the token has email available
   if (token?.email) {
      let boughtEvents: LivestreamEvent[] = []

      // get all the recorded events for a specific user
      // get the user stats in order to have access to the bought event ids
      promises.push(
         livestreamRepo.getRecordedEventsByUserId(token?.email, todayLess5Days),
         getServerSideUserStats(token.email)
      )

      const results = await Promise.allSettled(promises)

      const [availableRecordings, userStats] = results.map((result) =>
         result.status === "fulfilled"
            ? (result as PromiseFulfilledResult<any>).value
            : null
      )

      // get the livestreams each bought recording ids and get each livestream by ids
      if (userStats?.recordingsBought?.length) {
         boughtEvents =
            (await livestreamRepo.getLivestreamsByIds(
               userStats.recordingsBought
            )) || []
      }

      return {
         props: {
            unlockedEvents: [
               ...(availableRecordings?.length ? availableRecordings : []),
               ...(boughtEvents?.length ? boughtEvents : []),
            ].map(LivestreamPresenter.serializeDocument),
         },
      }
   }

   return {
      props: {
         unlockedEvents: [],
      },
   }
}

export default UnlockedContent

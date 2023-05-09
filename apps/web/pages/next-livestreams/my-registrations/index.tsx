import SEO from "../../../components/util/SEO"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"
import ScrollToTop from "../../../components/views/common/ScrollToTop"
import React, { useMemo } from "react"
import { StreamsSection } from "components/views/common/NextLivestreams/StreamsSection"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import {
   getUserTokenFromCookie,
   mapFromServerSide,
} from "../../../util/serverUtil"
import { livestreamRepo } from "../../../data/RepositoryInstances"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import { Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import NoResultsMessage from "../../../components/views/common/NextLivestreams/NoResultsMessage"

const styles = sxStyles({
   noResultsMessage: {
      maxWidth: "800px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
      textAlign: "center",
   },
})

const MyRegistrations = ({
   registeredEvents,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const upcomingLivestreams = useMemo(
      () => mapFromServerSide(registeredEvents),
      [registeredEvents]
   )

   const noResultsMessage = useMemo<JSX.Element>(
      () => (
         <Grid xs={12} mt={4} mx={1} item>
            <Typography sx={styles.noResultsMessage} variant="h5">
               {/* eslint-disable-next-line react/no-unescaped-entities */}
               Currently you don't have any upcoming events booked 😕
            </Typography>
         </Grid>
      ),
      []
   )

   return (
      <>
         <SEO
            id={"CareerFairy | My Registrations"}
            description={"CareerFairy | My Registrations"}
            title={"CareerFairy | My Registrations"}
         />
         <GenericDashboardLayout pageDisplayName={"My Registrations"}>
            <StreamsSection
               value={"upcomingEvents"}
               upcomingLivestreams={upcomingLivestreams}
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

   let registeredEvents = []
   // only do the logic if the token has email available
   if (token?.email) {
      registeredEvents = await livestreamRepo.getRegisteredEvents(token.email, {
         from: new Date(),
      })
   }

   return {
      props: {
         registeredEvents: registeredEvents.map(
            LivestreamPresenter.serializeDocument
         ),
      },
   }
}
export default MyRegistrations

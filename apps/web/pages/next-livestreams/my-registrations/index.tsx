import SEO from "../../../components/util/SEO"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"
import ScrollToTop from "../../../components/views/common/ScrollToTop"
import React, { useMemo } from "react"
import { StreamsSection } from "components/views/common/NextLivestreams/StreamsSection"
import { Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import NoResultsMessage from "../../../components/views/common/NextLivestreams/NoResultsMessage"
import useListenToUpcomingStreams from "../../../components/custom-hook/useListenToUpcomingStreams"
import { useAuth } from "../../../HOCs/AuthProvider"

const styles = sxStyles({
   noResultsMessage: {
      maxWidth: "800px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
      textAlign: "center",
   },
})

const MyRegistrations = () => {
   const { userData } = useAuth()
   const nowDate = useMemo(() => new Date(), [])

   const upcomingLivestreams = useListenToUpcomingStreams({
      registeredUserEmail: userData?.userEmail,
      from: nowDate,
   })

   const noResultsMessage = useMemo<JSX.Element>(
      () => (
         <Grid xs={12} mx={1} item>
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

export default MyRegistrations

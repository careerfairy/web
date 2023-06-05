import SEO from "../../../components/util/SEO"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"
import ScrollToTop from "../../../components/views/common/ScrollToTop"
import React, { useMemo } from "react"
import { StreamsSection } from "components/views/common/NextLivestreams/StreamsSection"
import { Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import NoResultsMessage from "../../../components/views/common/NextLivestreams/NoResultsMessage"
import useListenToStreams from "../../../components/custom-hook/useListenToStreams"
import { useAuth } from "../../../HOCs/AuthProvider"
import Link from "../../../components/views/common/Link"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import {
   LivestreamDialogLayout,
   livestreamDialogSSP,
} from "../../../components/views/livestream-dialog"
import { InferGetServerSidePropsType, NextPage } from "next"

const styles = sxStyles({
   noResultsMessage: {
      maxWidth: "800px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
      textAlign: "center",
   },
})

const MyRegistrations: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
   const { userData } = useAuth()
   const isMobile = useIsMobile()

   const nowDate = useMemo(() => new Date(), [])

   const upcomingLivestreams = useListenToStreams({
      registeredUserEmail: userData?.userEmail,
      from: nowDate,
   })

   const noResultsMessage = useMemo<JSX.Element>(
      () => (
         <Grid xs={12} mx={1} item>
            <Typography sx={styles.noResultsMessage} variant="h5">
               {/* eslint-disable-next-line react/no-unescaped-entities */}
               {isMobile ? "You" : "Currently you"} are not registered to any
               live stream 😕 <br />
               Check them out <Link href="/next-livestreams">here</Link>
            </Typography>
         </Grid>
      ),
      [isMobile]
   )

   return (
      <>
         <SEO
            id={"CareerFairy | My Registrations"}
            description={"CareerFairy | My Registrations"}
            title={"CareerFairy | My Registrations"}
         />
         <GenericDashboardLayout pageDisplayName={"My Registrations"}>
            <LivestreamDialogLayout
               livestreamDialogData={props.livestreamDialogData}
            >
               <StreamsSection
                  value={"upcomingEvents"}
                  upcomingLivestreams={upcomingLivestreams}
                  listenToUpcoming
                  minimumUpcomingStreams={0}
                  noResultsComponent={
                     <NoResultsMessage message={noResultsMessage} />
                  }
               />
            </LivestreamDialogLayout>
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

export const getServerSideProps = livestreamDialogSSP()

export default MyRegistrations

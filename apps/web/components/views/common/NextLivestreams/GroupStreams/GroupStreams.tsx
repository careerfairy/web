import { Group } from "@careerfairy/shared-lib/groups"
import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { Box, Grid, LinearProgress, Typography } from "@mui/material"
import { useAutoPlayGrid } from "components/custom-hook/utils/useAutoPlayGrid"
import { isLivestreamDialogOpen } from "components/views/livestream-dialog/LivestreamDialogLayout"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { InView } from "react-intersection-observer"
import { sxStyles } from "../../../../../types/commonTypes"
import useInfiniteScrollClientWithHandlers from "../../../../custom-hook/useInfiniteScrollClientWithHandlers"
import useRegistrationModal from "../../../../custom-hook/useRegistrationModal"
import { isEmptyObject } from "../../../../helperFunctions/HelperFunctions"
import ShareLivestreamModal from "../../ShareLivestreamModal"
import RegistrationModal from "../../registration-modal"
import EventPreviewCard from "../../stream-cards/EventPreviewCard"

const styles = sxStyles({
   emptyMessage: {
      maxWidth: "400px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
   },
   loaderWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
   },
})

type GroupStreamsProps = {
   groupData: Group
   livestreams: LivestreamEvent[]
   mobile: boolean
   searching: boolean
   listenToUpcoming: boolean
   isPastLivestreams: boolean
   noResultsComponent?: React.ReactNode
}
const GroupStreams = ({
   groupData,
   livestreams,
   searching,
   listenToUpcoming,
   isPastLivestreams,
   noResultsComponent,
}: GroupStreamsProps) => {
   const { query } = useRouter()
   const { groupId } = query
   const { joinGroupModalData, handleCloseJoinModal } = useRegistrationModal()
   const [globalCardHighlighted, setGlobalCardHighlighted] = useState(false)
   const isLSDialogOpen = isLivestreamDialogOpen(query)

   const searchedButNoResults = useMemo(
      () => !searching && !livestreams?.length,
      [livestreams?.length, searching]
   )
   const [slicedLivestreams] = useInfiniteScrollClientWithHandlers(
      livestreams,
      6,
      3
   )

   const {
      shouldDisableAutoPlay,
      moveToNextElement,
      ref: autoPlayRef,
      handleInViewChange,
   } = useAutoPlayGrid()

   useEffect(() => {
      if (globalCardHighlighted) {
         setGlobalCardHighlighted(false)
      }
   }, [groupData, globalCardHighlighted])

   const [shareEventDialog, setShareEventDialog] = useState(null)

   const handleShareEventDialogClose = useCallback(() => {
      setShareEventDialog(null)
   }, [setShareEventDialog])

   const location = useMemo(() => {
      if (isEmptyObject(groupData)) {
         return isPastLivestreams
            ? ImpressionLocation.pastLivestreams
            : ImpressionLocation.nextLivestreams
      }
      return isPastLivestreams
         ? ImpressionLocation.pastLivestreamsGroup
         : ImpressionLocation.nextLivestreamsGroup
   }, [groupData, isPastLivestreams])

   const renderStreamCards = useMemo(
      () =>
         slicedLivestreams?.map((livestream, index, arr) => {
            if (livestream) {
               return (
                  <Grid
                     key={livestream.id}
                     xs={12}
                     lsCardsGallery={6}
                     lg={4}
                     xl={3}
                     item
                  >
                     <InView triggerOnce>
                        {({ inView, ref }) =>
                           inView ? (
                              <EventPreviewCard
                                 ref={ref}
                                 index={index}
                                 totalElements={arr.length}
                                 location={location}
                                 event={livestream}
                                 disableAutoPlay={
                                    isLSDialogOpen ||
                                    (isPastLivestreams
                                       ? shouldDisableAutoPlay(index)
                                       : true)
                                 }
                                 onGoNext={moveToNextElement}
                                 onViewChange={handleInViewChange(index)}
                              />
                           ) : (
                              <EventPreviewCard ref={ref} loading />
                           )
                        }
                     </InView>
                  </Grid>
               )
            }
         }),
      [
         location,
         slicedLivestreams,
         isPastLivestreams,
         handleInViewChange,
         shouldDisableAutoPlay,
         moveToNextElement,
         isLSDialogOpen,
      ]
   )

   return (
      <>
         <Box sx={{ p: { xs: 0, md: 2 }, width: "100%" }} ref={autoPlayRef}>
            <Grid container spacing={2}>
               {groupData.id || listenToUpcoming ? (
                  searching ? (
                     <Grid xs={12} item sx={styles.loaderWrapper}>
                        <LinearProgress
                           style={{ width: "80%" }}
                           color="primary"
                        />
                     </Grid>
                  ) : livestreams.length ? (
                     renderStreamCards
                  ) : noResultsComponent ? (
                     noResultsComponent
                  ) : (
                     <Grid xs={12} item sx={styles.loaderWrapper}>
                        <Typography
                           sx={styles.emptyMessage}
                           align="center"
                           variant="h5"
                           style={{ marginTop: 100 }}
                        >
                           {searchedButNoResults ? (
                              "We couldn't find anything... 😕"
                           ) : (
                              <strong>
                                 {groupData.universityName} currently has no{" "}
                                 {isPastLivestreams ? "past" : "scheduled"} live
                                 streams
                              </strong>
                           )}
                        </Typography>
                     </Grid>
                  )
               ) : null}
               {shareEventDialog ? (
                  <ShareLivestreamModal
                     livestreamData={shareEventDialog}
                     handleClose={handleShareEventDialogClose}
                  />
               ) : (
                  ""
               )}
            </Grid>
         </Box>
         {joinGroupModalData ? (
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               onFinish={handleCloseJoinModal}
               promptOtherEventsOnFinal={!groupId}
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
               targetGroupId={joinGroupModalData?.targetGroupId}
               handleClose={handleCloseJoinModal}
            />
         ) : null}
      </>
   )
}
export default GroupStreams

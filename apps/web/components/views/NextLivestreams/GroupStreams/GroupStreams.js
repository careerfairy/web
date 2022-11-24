import React, { useCallback, useEffect, useState } from "react"
import { Box, Grid, LinearProgress, Typography } from "@mui/material"
import LazyLoad from "react-lazyload"
import useInfiniteScrollClientWithHandlers from "../../../custom-hook/useInfiniteScrollClientWithHandlers"
import ShareLivestreamModal from "../../common/ShareLivestreamModal"
import EventPreviewCard from "../../common/stream-cards/EventPreviewCard"
import RegistrationModal from "../../common/registration-modal"
import { useRouter } from "next/router"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import { useInterests } from "../../../custom-hook/useCollection"

const styles = {
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
}

const Wrapper = ({ children, streamId }) => {
   return (
      <LazyLoad
         key={streamId}
         style={{ width: "100%" }}
         height={309}
         debounce={100}
         scroll
         offset={600}
         placeholder={<EventPreviewCard loading />}
      >
         {children}
      </LazyLoad>
   )
}

const GroupStreams = ({
   groupData,
   livestreams,
   mobile,
   searching,
   listenToUpcoming,
   isPastLivestreams,
}) => {
   const {
      query: { groupId },
   } = useRouter()
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal()
   const { data: existingInterests } = useInterests()
   const [globalCardHighlighted, setGlobalCardHighlighted] = useState(false)
   const searchedButNoResults = !searching && !livestreams?.length
   const [slicedLivestreams] = useInfiniteScrollClientWithHandlers(
      livestreams,
      6,
      3
   )

   useEffect(() => {
      if (globalCardHighlighted) {
         setGlobalCardHighlighted(false)
      }
   }, [groupData])

   const [shareEventDialog, setShareEventDialog] = useState(null)

   const handleShareEventDialogClose = useCallback(() => {
      setShareEventDialog(null)
   }, [setShareEventDialog])

   const renderStreamCards = slicedLivestreams?.map((livestream, index) => {
      if (livestream) {
         return (
            <Grid key={livestream.id} xs={12} sm={6} lg={4} xl={4} item>
               <Wrapper streamId={livestream.id}>
                  <EventPreviewCard
                     onRegisterClick={handleClickRegister}
                     interests={existingInterests}
                     autoRegister
                     index={index}
                     totalElements={slicedLivestreams.length}
                     event={livestream}
                     openShareDialog={setShareEventDialog}
                  />
               </Wrapper>
            </Grid>
         )
      }
   })

   return (
      <>
         <Box sx={{ p: { xs: 0, md: 2 }, width: "100%" }}>
            <Grid container spacing={mobile ? 2 : 3}>
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
         {joinGroupModalData && (
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               onFinish={handleCloseJoinModal}
               promptOtherEventsOnFinal={!groupId}
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
               targetGroupId={joinGroupModalData?.targetGroupId}
               handleClose={handleCloseJoinModal}
            />
         )}
      </>
   )
}
export default GroupStreams

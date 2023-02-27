import { sxStyles } from "../../../../types/commonTypes"
import { Box, Button, Stack, Typography } from "@mui/material"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { placeholderBanner } from "../../../../constants/images"
import React, { useCallback, useMemo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import DateUtil from "../../../../util/DateUtil"
import { useCompanyPage } from "../index"
import Link from "../../common/Link"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { ChevronRight } from "@mui/icons-material"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { getRelevantHosts } from "../../../../util/streamUtil"

const styles = sxStyles({
   wrapper: {
      minHeight: (theme) => theme.spacing(40),
      width: "100%",
      borderRadius: "12px",
      pr: 1,
   },
   backgroundImage: {
      width: "100%",
      height: "158px",
      transition: (theme) =>
         theme.transitions.create(["height", "transform"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      objectFit: "cover",
      borderRadius: "12px 12px 0 0",
   },
   content: {
      border: "1px solid #EDE7FD",
      borderTop: "none",
      borderRadius: "0 0 12px 12px",
      p: 2,
   },
   button: {
      display: "flex",
      justifyContent: "end",
      mt: (theme) => `${theme.spacing(3)} !important`,
   },
   buttonsWrapper: {
      display: "flex",
      mt: (theme) => `${theme.spacing(3)} !important`,
      justifyContent: "space-between",
   },
   registerButton: {
      py: 1,
   },
   detailsButton: {
      p: 0,
   },
})

type Props = {
   event: LivestreamEvent
   handleEditEvent: (event: LivestreamEvent) => void
   handleRegister: (
      event: LivestreamEvent,
      targetGroupId: string,
      groups: any[],
      hasRegistered: boolean
   ) => any
}

const EventCard = ({ event, handleEditEvent, handleRegister }: Props) => {
   const { editMode, group } = useCompanyPage()
   const isMobile = useIsMobile()
   const { userData } = useAuth()
   const firebaseService = useFirebaseService()

   const eventPresenter = LivestreamPresenter.createFromDocument(event)
   const isRegistered = useMemo(
      () => eventPresenter.isUserRegistered(userData?.userEmail),
      [eventPresenter, userData?.userEmail]
   )

   const handleRegisterClick = useCallback(async () => {
      const newHosts = await firebaseService.getCareerCentersByGroupId(
         event?.groupIds || []
      )
      const hosts = newHosts.length
         ? getRelevantHosts(group?.groupId, event, newHosts)
         : null

      handleRegister(event, group?.id, hosts, isRegistered)
   }, [
      event,
      firebaseService,
      group.groupId,
      group?.id,
      handleRegister,
      isRegistered,
   ])

   return (
      <Box sx={styles.wrapper}>
         <Box
            component="img"
            sx={styles.backgroundImage}
            src={
               getResizedUrl(event?.backgroundImageUrl, "sm") ||
               placeholderBanner
            }
            alt={`event-${event?.title}-image`}
            loading="lazy"
         />
         <Box sx={styles.content}>
            <Stack spacing={1}>
               <Typography
                  fontWeight={400}
                  color={"text.secondary"}
                  fontSize={13}
               >
                  {DateUtil.eventPreviewDate(event?.startDate)}
               </Typography>

               <Typography fontWeight={600} fontSize={15}>
                  {event?.title}
               </Typography>

               {editMode ? (
                  <Box sx={styles.button}>
                     <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditEvent(event)}
                     >
                        MANAGE LIVE STREAM
                     </Button>
                  </Box>
               ) : (
                  <Box sx={styles.buttonsWrapper}>
                     <Button
                        endIcon={<ChevronRight fontSize={"large"} />}
                        sx={styles.detailsButton}
                        component={Link}
                        href={`/upcoming-livestream/${event?.id}`}
                        variant={"text"}
                        color={"primary"}
                        size={"small"}
                     >
                        {isMobile ? "details" : "see details"}
                     </Button>
                     <Button
                        sx={styles.registerButton}
                        onClick={handleRegisterClick}
                        variant={isRegistered ? "outlined" : "contained"}
                        color={isRegistered ? "secondary" : "primary"}
                        size={"medium"}
                     >
                        {isRegistered ? "cancel" : "Attend"}
                     </Button>
                  </Box>
               )}
            </Stack>
         </Box>
      </Box>
   )
}

export default EventCard

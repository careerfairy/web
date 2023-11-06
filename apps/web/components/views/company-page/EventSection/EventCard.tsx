import { sxStyles } from "../../../../types/commonTypes"
import { Box, Button, Stack, Typography } from "@mui/material"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { placeholderBanner } from "../../../../constants/images"
import React, { useCallback, useMemo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import DateUtil from "../../../../util/DateUtil"
import { useCompanyPage } from "../index"
import Link from "next/link"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { useAuth } from "../../../../HOCs/AuthProvider"
import ChevronRight from "@mui/icons-material/ChevronRight"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { getRelevantHosts } from "../../../../util/streamUtil"
import Image from "next/legacy/image"
import { getSubstringWithEllipsis } from "@careerfairy/shared-lib/utils"
import { buildDialogLink } from "../../livestream-dialog"
import { useRouter } from "next/router"

const styles = sxStyles({
   wrapper: {
      minHeight: (theme) => theme.spacing(40),
      width: "100%",
      borderRadius: "12px",
      pr: 1,
   },
   backgroundImageWrapper: {
      position: "relative",
      height: "158px",
      borderRadius: "12px 12px 0 0",
      overflow: "hidden",
      "&:hover": {
         "& $img": {
            transform: "scale(1.1)",
         },
      },
   },
   backgroundImageDarkOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      opacity: 0.2,
   },
   content: {
      border: "1px solid #EDE7FD",
      borderTop: "none",
      borderRadius: "0 0 12px 12px",
      p: 2,
      backgroundColor: "white",
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
      px: 1,
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
   const router = useRouter()
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

   const cardTitle = useMemo(() => {
      return getSubstringWithEllipsis(event?.title, 30)
   }, [event?.title])

   const linkProps = useMemo(
      () =>
         buildDialogLink({
            router,
            link: {
               livestreamId: event?.id,
               type: "livestreamDetails",
            },
         }),
      [router, event?.id]
   )

   return (
      <Box sx={styles.wrapper}>
         <Box sx={styles.backgroundImageWrapper}>
            <Image
               className={"backgroundImage"}
               objectFit={"cover"}
               layout={"fill"}
               src={
                  getResizedUrl(event?.backgroundImageUrl, "sm") ||
                  placeholderBanner
               }
               alt={`event-${event?.title}-image`}
            />
            <Box sx={styles.backgroundImageDarkOverlay} />
         </Box>
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
                  {cardTitle}
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
                     <Link
                        href={linkProps}
                        // Prevents GSSP from running on designated page:https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing
                        shallow
                        passHref
                        // Prevents the page from scrolling to the top when the link is clicked
                        scroll={false}
                        legacyBehavior
                     >
                        <Button
                           endIcon={<ChevronRight sx={{ mb: "2px" }} />}
                           sx={styles.detailsButton}
                           variant={"text"}
                           color={"primary"}
                           size={"small"}
                        >
                           {isMobile ? "details" : "see details"}
                        </Button>
                     </Link>
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

import { Button, Stack, Typography, useTheme } from "@mui/material"
import useGroup from "components/custom-hook/group/useGroup"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import useIsMobile from "components/custom-hook/useIsMobile"
import { LinkedInIcon } from "components/views/common/icons/LinkedInIcon"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useCallback } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   linkedInButtonInnerContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "baseline",
      gap: "6px",
      textAlign: "center",
   },
   linkedInButton: (theme) => ({
      color: theme.brand.info[700],
      border: `1px solid ${theme.brand.info[400]}`,
      "&:hover": {
         border: `1px solid ${theme.brand.info[400]}`,
         backgroundColor: theme.brand.info[50],
      },
      "& svg": {
         width: "14px",
         height: "14px",
      },
   }),
})

type LinkedinButtonProps = {
   streamerDetails: StreamerDetails
   onClick?: () => void
}

export const LinkedinButtonWithTracker = ({ streamerDetails }) => {
   const { data: streamerGroup } = useGroup(streamerDetails.groupId)
   const { data: visitorId } = useFingerPrint()
   const { trackMentorLinkedInReach } = useFirebaseService()

   const linkedInOnClick = useCallback(() => {
      if (streamerDetails.id && streamerGroup?.groupId) {
         trackMentorLinkedInReach(
            streamerGroup.groupId,
            streamerDetails.id,
            visitorId
         )
      }
   }, [streamerGroup, streamerDetails?.id, trackMentorLinkedInReach, visitorId])

   return (
      <LinkedInButton
         streamerDetails={streamerDetails}
         onClick={linkedInOnClick}
      />
   )
}

export const LinkedInButton = ({
   streamerDetails,
   onClick,
}: LinkedinButtonProps) => {
   const theme = useTheme()
   const isMobile = useIsMobile()

   return (
      <Button
         sx={styles.linkedInButton}
         variant="outlined"
         LinkComponent="a"
         href={streamerDetails.linkedInUrl}
         target="_blank"
         fullWidth={isMobile}
         onClick={() => {
            onClick?.()
         }}
      >
         <Stack sx={styles.linkedInButtonInnerContainer}>
            <LinkedInIcon fill={theme.brand.info[700]} />
            <Typography variant="small">Reach out on LinkedIn</Typography>
         </Stack>
      </Button>
   )
}

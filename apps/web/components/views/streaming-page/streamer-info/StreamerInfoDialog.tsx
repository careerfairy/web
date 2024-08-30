import CloseIcon from "@mui/icons-material/Close"
import {
   Avatar,
   Box,
   CircularProgress,
   Dialog,
   DialogContent,
   DialogTitle,
   IconButton,
   Stack,
   SwipeableDrawer,
   Typography,
} from "@mui/material"
import { useLivestreamData } from "components/custom-hook/streaming"
import { StreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { memo } from "react"
import { sxStyles } from "types/commonTypes"
import { getStreamerDisplayName } from "../util"
import { LinkedInButton, LinkedinButtonWithTracker } from "./LinkedinButton"
import { ProfileButton } from "./ProfileButton"

const styles = sxStyles({
   dialogTitle: {
      padding: "16px 16px 2px 0",
   },
   dialogTitleMobile: (theme) => ({
      display: "flex",
      padding: "17px 16px",
      position: "sticky",
      top: 0,
      justifyContent: "flex-start",
      alignItems: "center",
      borderRadius: "12px 12px 0px 0px",
      borderBottom: `1px solid ${theme.brand.white[400]}`,
      background: theme.brand.white[100],
      zIndex: 1,
   }),
   title: {
      display: "flex",
      justifyContent: "flex-end",
   },
   closeButton: {
      width: "32px",
      height: "32px",
      flexShrink: 0,
   },
   closeButtonMobile: {
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      p: 0,
   },
   drawer: {
      borderRadius: "12px 12px 0 0",
      maxHeight: "90%",
   },
   drawerContent: {
      display: "flex",
      padding: "8px 16px 16px 16px",
      flexDirection: "column",
   },
   avatar: {
      height: "80px",
      width: "80px",
   },
   avatarAndName: {
      flexDirection: "row",
      gap: "8px",
      flexGrow: 1,
   },
   nameAndRole: {
      justifyContent: "center",
      alignItems: "flex-start",
      flex: "1 0 0",
   },
   fontWeight: {
      fontWeight: 600,
   },
   role: {
      color: (theme) => theme.palette.neutral[500],
   },
   actionsWrapper: {
      gap: "8px",
      alignItems: "center",
   },
})

type Props = {
   open: boolean
   handleClose: () => void
   streamerDetails: StreamerDetails
}

export const StreamerInfoDialog = memo(
   ({ open, handleClose, streamerDetails }: Props) => {
      const isMobile = useIsMobile()

      if (isMobile) {
         return (
            <MobileDrawer
               open={open}
               handleClose={handleClose}
               streamerDetails={streamerDetails}
            />
         )
      }

      return (
         <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={"md"}
            fullWidth
            disableEnforceFocus
         >
            <DialogTitle sx={styles.dialogTitle}>
               <Box sx={styles.title}>
                  <IconButton
                     color="inherit"
                     onClick={handleClose}
                     aria-label="close"
                     sx={styles.closeButton}
                  >
                     <CloseIcon />
                  </IconButton>
               </Box>
            </DialogTitle>
            <DialogContent>
               <SuspenseWithBoundary fallback={<CircularProgress />}>
                  <StreamerDetailsContent streamerDetails={streamerDetails} />
               </SuspenseWithBoundary>
            </DialogContent>
         </Dialog>
      )
   }
)

StreamerInfoDialog.displayName = "StreamerInfoDialog"

const MobileDrawer = ({ handleClose, open, streamerDetails }: Props) => {
   return (
      <SwipeableDrawer
         onClose={handleClose}
         open={open}
         anchor="bottom"
         PaperProps={{
            sx: styles.drawer,
         }}
         onOpen={() => {}}
         disableEnforceFocus
      >
         <Box sx={styles.dialogTitleMobile}>
            <IconButton
               color="inherit"
               onClick={handleClose}
               aria-label="close"
               sx={styles.closeButtonMobile}
            >
               <CloseIcon />
            </IconButton>
         </Box>
         <Box sx={styles.drawerContent}>
            <SuspenseWithBoundary fallback={<CircularProgress />}>
               <StreamerDetailsContent streamerDetails={streamerDetails} />
            </SuspenseWithBoundary>
         </Box>
      </SwipeableDrawer>
   )
}

const StreamerDetailsContent = ({ streamerDetails }: StreamerDetailsProps) => {
   const isMobile = useIsMobile()

   const displayName = getStreamerDisplayName(
      streamerDetails.firstName,
      streamerDetails.lastName
   )

   const defaultABoutText = `${displayName} is too cool for introductions. Ask them your questions during the live stream.`

   return (
      <Stack spacing={3}>
         <Stack direction={isMobile ? "column" : "row"} spacing={1.5}>
            <StreamerAvatar streamerDetails={streamerDetails} />
            <StreamerActions streamerDetails={streamerDetails} />
         </Stack>
         <Stack spacing={2}>
            <Typography sx={styles.fontWeight} variant="brandedH5">
               About the speaker
            </Typography>
            <Typography variant="brandedBody">
               {streamerDetails.background ?? defaultABoutText}
            </Typography>
         </Stack>
      </Stack>
   )
}

type StreamerDetailsProps = {
   streamerDetails: StreamerDetails
}

const StreamerAvatar = ({ streamerDetails }: StreamerDetailsProps) => {
   const displayName = getStreamerDisplayName(
      streamerDetails.firstName,
      streamerDetails.lastName
   )
   return (
      <Stack sx={styles.avatarAndName}>
         <Avatar
            src={streamerDetails.avatarUrl}
            alt={displayName}
            sx={styles.avatar}
         />
         <Stack sx={styles.nameAndRole}>
            <Typography variant="brandedH5" sx={styles.fontWeight}>
               {displayName}
            </Typography>
            <Typography variant="small" sx={styles.role}>
               {streamerDetails.role}
            </Typography>
         </Stack>
      </Stack>
   )
}

const StreamerActions = ({ streamerDetails }: StreamerDetailsProps) => {
   const isMobile = useIsMobile()
   const livestream = useLivestreamData()

   const isCreator =
      livestream?.creatorsIds?.includes(streamerDetails.id) &&
      Boolean(streamerDetails.groupId)

   return (
      <Stack
         direction={isMobile ? "column-reverse" : "row"}
         sx={styles.actionsWrapper}
      >
         {Boolean(isCreator) && (
            <ProfileButton streamerDetails={streamerDetails} />
         )}
         {Boolean(streamerDetails.linkedInUrl) &&
            (streamerDetails.groupId ? (
               <LinkedinButtonWithTracker streamerDetails={streamerDetails} />
            ) : (
               <LinkedInButton streamerDetails={streamerDetails} />
            ))}
      </Stack>
   )
}

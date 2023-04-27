import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import {
   Alert,
   Box,
   Button,
   Collapse,
   Divider,
   Grid,
   Hidden,
   IconButton,
   Skeleton,
   Tooltip,
   Typography,
} from "@mui/material"
import DateUtil from "../../../../util/DateUtil"
import CheckIcon from "@mui/icons-material/Check"
import CalendarIcon from "@mui/icons-material/CalendarToday"
import { useRouter } from "next/router"
import { AddToCalendar } from "../../common/AddToCalendar"
import ShareOutlined from "@mui/icons-material/ShareOutlined"
import ShareLivestreamModal from "../../common/ShareLivestreamModal"
import { streamIsOld } from "../../../../util/CommonUtil"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { sxStyles } from "types/commonTypes"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import Link from "components/views/common/Link"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import { maybePluralize } from "components/helperFunctions/HelperFunctions"
import { rewardService } from "data/firebase/RewardService"
import LoadingButton from "@mui/lab/LoadingButton"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import CareerCoinIcon from "components/views/common/CareerCoinIcon"

const styles = sxStyles({
   countDownWrapper: {
      flexWrap: "nowrap",
      display: "flex",
      justifyContent: "space-around",
      width: "100%",
   },
   timeElement: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   timeType: {
      fontWeight: 900,
   },
   timeLeft: {
      fontWeight: 700,
   },
   dateTimeWrapper: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "nowrap",
      alignItems: "center",
   },
   dateTime: {
      fontWeight: 500,
      flexGrow: 1,
   },
   streamStartingNoticeWrapper: (theme) => ({
      paddingBottom: theme.spacing(1),
      [theme.breakpoints.up("sm")]: {
         paddingBottom: theme.spacing(2),
      },
   }),
   alert: {
      borderRadius: (theme) => theme.spacing(1),
   },
   addToCalendarIconBtn: {
      border: (theme) => `1px solid ${theme.palette.text.secondary}`,
      borderRadius: (theme) => theme.spacing(0.5),
   },
   addToCalendarBtn: {},
   divider: {
      margin: (theme) => theme.spacing(1, 0),
   },
})

// eslint-disable-next-line react/display-name
const TimerText = memo(({ time }: { time: any }) => {
   const calculateTimeLeft = () => DateUtil.calculateTimeLeft(time)

   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

   useEffect(() => {
      const timeout = setTimeout(() => {
         setTimeLeft(calculateTimeLeft())
      }, 1000)
      return () => clearTimeout(timeout)
   })
   return (
      <Box sx={styles.countDownWrapper}>
         {Object.keys(timeLeft).map((interval, index) => (
            <Box key={index} sx={styles.timeElement}>
               <Typography variant="h3" sx={styles.timeLeft}>
                  {timeLeft[interval]}
               </Typography>
               <Typography variant="body1" sx={styles.timeType}>
                  {interval}
               </Typography>
            </Box>
         ))}
      </Box>
   )
})

const mobileSpacing = 1
const desktopSpacing = 2

type CountDownProps = {
   time: string
   disabled: boolean
   onRegisterClick: () => void
   stream: LivestreamEvent
   streamAboutToStart: boolean
   isPastEvent: boolean
   registered: boolean
   userIsLoggedIn: boolean
}

const CountDown = ({
   time,
   disabled,
   onRegisterClick,
   registered,
   stream,
   streamAboutToStart,
   isPastEvent,
   userIsLoggedIn,
}: CountDownProps) => {
   const {
      query: { livestreamId, groupId },
   } = useRouter()

   const { authenticatedUser, userData, isLoggedIn } = useAuth()

   const event = useMemo(() => {
      const linkToStream = `https://careerfairy.io/upcoming-livestream/${livestreamId}${
         groupId ? `?groupId=${groupId}` : ""
      }`
      return {
         name: stream.title,
         details: `Here is your Link: ${linkToStream}`,
         location: "Hosted virtually on CareerFairy (link in the description)",
         startsAt: new Date(time).toISOString(),
         endsAt: new Date(
            new Date(time).getTime() + (stream.duration || 45) * 60 * 1000
         ).toISOString(),
      }
   }, [livestreamId, groupId, stream.title, stream.duration, time])

   const [shareEventDialog, setShareEventDialog] = useState(null)

   const handleShareEventDialogClose = useCallback(() => {
      setShareEventDialog(null)
   }, [setShareEventDialog])

   const registerComponent = useMemo(() => {
      if (isPastEvent) {
         if (stream.denyRecordingAccess) {
            return (
               <RegisterButton
                  onRegisterClick={onRegisterClick}
                  disabled={disabled}
                  registered={registered}
                  label={
                     registered
                        ? "You attended this event"
                        : "Recording Not Available"
                  }
               />
            )
         }

         // we know from the server side data the user is signed in
         // but we're still loading the user on the client side
         if (userIsLoggedIn && (!isLoggedIn || !userData)) {
            return <Skeleton variant="text" animation="wave" height={60} />
         }

         if (!isLoggedIn) {
            return <SignUpToWatchButton onRegisterClick={onRegisterClick} />
         }

         if (!userData?.credits) {
            return <NotEnoughCreditsButton />
         }

         return <BuyRecordingButton livestreamId={stream.id} />
      }

      if (registered) {
         return (
            <RegisterButton
               onRegisterClick={onRegisterClick}
               disabled={disabled}
               registered={registered}
               label="You're booked"
            />
         )
      }

      if (
         stream.maxRegistrants &&
         stream.maxRegistrants > 0 &&
         stream.registeredUsers &&
         stream.maxRegistrants <= stream.registeredUsers.length
      ) {
         return (
            <RegisterButton
               onRegisterClick={onRegisterClick}
               disabled={disabled}
               registered={registered}
               label="No spots left"
            />
         )
      }

      if (authenticatedUser) {
         return (
            <RegisterButton
               onRegisterClick={onRegisterClick}
               disabled={disabled}
               registered={registered}
               label="Attend Event"
            />
         )
      }

      return (
         <RegisterButton
            onRegisterClick={onRegisterClick}
            disabled={disabled}
            registered={registered}
            label="Join to attend"
         />
      )
   }, [
      userData,
      userIsLoggedIn,
      isPastEvent,
      registered,
      stream.maxRegistrants,
      stream.registeredUsers,
      stream.denyRecordingAccess,
      stream.id,
      authenticatedUser,
      onRegisterClick,
      disabled,
      isLoggedIn,
   ])

   return (
      <>
         <Grid container spacing={{ xs: mobileSpacing, md: desktopSpacing }}>
            <Grid item xs={12}>
               <Collapse in={streamAboutToStart}>
                  <Box sx={styles.streamStartingNoticeWrapper}>
                     <Alert
                        sx={styles.alert}
                        variant="standard"
                        severity="info"
                        iconMapping={{
                           info: <InfoOutlinedIcon sx={{ color: "#626262" }} />,
                        }}
                     >
                        PLEASE WAIT HERE! YOU WILL BE REDIRECTED WHEN THE STREAM
                        STARTS.
                     </Alert>
                  </Box>
               </Collapse>
               <Box sx={styles.dateTimeWrapper}>
                  <Typography align="left" sx={styles.dateTime} variant="h6">
                     {isPastEvent && !stream.denyRecordingAccess
                        ? `Release Date: ${DateUtil.getRatingDate(time)}`
                        : DateUtil.getUpcomingDate(time)}
                  </Typography>
                  <Hidden smDown>
                     {streamIsOld(stream.start) ? null : (
                        <MobileActions
                           event={event}
                           setShareEventDialog={setShareEventDialog}
                           stream={stream}
                        />
                     )}
                  </Hidden>
               </Box>
               <Divider sx={styles.divider} />

               <TimerText time={time} />
            </Grid>
            <Grid item xs={12}>
               {registerComponent}
            </Grid>
            <Hidden smUp>
               <Grid item xs={12}>
                  {streamIsOld(stream.start) ? null : (
                     <DesktopActions
                        event={event}
                        setShareEventDialog={setShareEventDialog}
                        stream={stream}
                     />
                  )}
               </Grid>
            </Hidden>
         </Grid>
         {shareEventDialog ? (
            <ShareLivestreamModal
               livestreamData={shareEventDialog}
               handleClose={handleShareEventDialogClose}
            />
         ) : (
            ""
         )}
      </>
   )
}

const SignUpToWatchButton = ({ onRegisterClick }) => {
   return (
      <>
         <Button
            id="register-button"
            color="primary"
            sx={{ color: "text.primary", boxShadow: "none" }}
            variant={"contained"}
            fullWidth
            onClick={onRegisterClick}
            disableElevation
            data-testid="livestream-registration-button"
            size="large"
         >
            Sign Up to Watch
         </Button>
         <Typography sx={{ textAlign: "center", marginTop: 2 }}>
            Already have an account?{" "}
            <Link color="text.primary" onClick={onRegisterClick} href="#">
               Log In
            </Link>
         </Typography>
      </>
   )
}

const BuyRecordingButton = ({ livestreamId }: { livestreamId: string }) => {
   const { userData } = useAuth()
   const [isLoading, setIsLoading] = useState(false)
   const { errorNotification } = useSnackbarNotifications()

   const handleClick = () => {
      setIsLoading(true)
      rewardService
         .buyRecordingAccess(livestreamId)
         .catch(errorNotification)
         .finally(() => setIsLoading(false))
   }

   return (
      <>
         <LoadingButton
            id="register-button"
            color="primary"
            sx={{ color: "text.primary", boxShadow: "none" }}
            variant={"contained"}
            fullWidth
            onClick={handleClick}
            disableElevation
            loading={isLoading}
            data-testid="livestream-registration-button"
            size="large"
            endIcon={isLoading ? undefined : <CareerCoinIcon />}
         >
            Unlock Live Stream Recording
         </LoadingButton>
         <Typography sx={{ textAlign: "center", marginTop: 2 }}>
            You have {userData.credits}{" "}
            {maybePluralize(userData.credits, "credit")} left
         </Typography>
      </>
   )
}

const NotEnoughCreditsButton = () => {
   const handleClick = (e: React.SyntheticEvent) => {
      e.preventDefault()

      // should trigger the buy credits modal
   }

   return (
      <>
         <Button
            id="register-button"
            color="black"
            // sx={{ color: "text.primary" }}
            sx={{ boxShadow: "none" }}
            variant={"contained"}
            fullWidth
            onClick={handleClick}
            disableElevation
            data-testid="livestream-registration-button"
            size="large"
            endIcon={<CareerCoinIcon />}
         >
            Not Enough Credits
         </Button>
         <Typography sx={{ textAlign: "center", marginTop: 2 }}>
            <Link sx={{ color: "text.primary" }} onClick={handleClick} href="#">
               Get more credits
            </Link>
         </Typography>
      </>
   )
}

const RegisterButton = ({ disabled, onRegisterClick, registered, label }) => {
   return (
      <Button
         id="register-button"
         color={registered ? "secondary" : "primary"}
         variant={"contained"}
         sx={{ boxShadow: "none", color: "text.primary" }}
         fullWidth
         startIcon={registered ? <CheckIcon /> : null}
         disabled={disabled || registered}
         onClick={onRegisterClick}
         disableElevation
         data-testid="livestream-registration-button"
         size="large"
      >
         {label}
      </Button>
   )
}

const DesktopActions = ({ event, setShareEventDialog, stream }) => {
   return (
      <>
         <Box
            sx={{
               mb: { xs: mobileSpacing, md: desktopSpacing },
            }}
         >
            <Tooltip arrow placement="top" title={"Share Event"}>
               <Button
                  onClick={() => setShareEventDialog(stream)}
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={styles.addToCalendarBtn}
                  startIcon={<ShareOutlined />}
               >
                  Share Event
               </Button>
            </Tooltip>
         </Box>

         <AddToCalendar event={event} filename={`${stream.company}-event`}>
            {(handleClick) => (
               <Tooltip arrow placement="top" title={"Add to calendar"}>
                  <Button
                     onClick={handleClick}
                     variant="outlined"
                     fullWidth
                     size="large"
                     sx={styles.addToCalendarBtn}
                     startIcon={<CalendarIcon />}
                  >
                     ADD TO CALENDAR
                  </Button>
               </Tooltip>
            )}
         </AddToCalendar>
      </>
   )
}

const MobileActions = ({ setShareEventDialog, stream, event }) => {
   return (
      <>
         <Box mr={1}>
            <Tooltip arrow placement="top" title={"Share Event"}>
               <IconButton
                  sx={styles.addToCalendarIconBtn}
                  size="large"
                  onClick={() => setShareEventDialog(stream)}
               >
                  <ShareOutlined />
               </IconButton>
            </Tooltip>
         </Box>

         <AddToCalendar event={event} filename={`${stream.company}-event`}>
            {(handleClick) => (
               <Tooltip arrow placement="top" title={"Add to calendar"}>
                  <IconButton
                     onClick={handleClick}
                     sx={styles.addToCalendarIconBtn}
                     size="large"
                  >
                     <CalendarIcon />
                  </IconButton>
               </Tooltip>
            )}
         </AddToCalendar>
      </>
   )
}

export default CountDown

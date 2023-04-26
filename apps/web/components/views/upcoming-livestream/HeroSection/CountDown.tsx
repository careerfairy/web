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
const CountDown = ({
   time,
   registerButtonLabel,
   disabled,
   onRegisterClick,
   registered,
   stream,
   streamAboutToStart,
}) => {
   const {
      query: { livestreamId, groupId },
   } = useRouter()
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
                     {DateUtil.getUpcomingDate(time)}
                  </Typography>
                  <Hidden smDown>
                     <Box mr={1}>
                        <Tooltip arrow placement="top" title={"Share Event"}>
                           <IconButton
                              sx={styles.addToCalendarIconBtn}
                              // variant="outlined"
                              size="large"
                              onClick={() => setShareEventDialog(stream)}
                           >
                              <ShareOutlined />
                           </IconButton>
                        </Tooltip>
                     </Box>

                     <AddToCalendar
                        event={event}
                        filename={`${stream.company}-event`}
                     >
                        {(handleClick) => (
                           <Tooltip
                              arrow
                              placement="top"
                              title={"Add to calendar"}
                           >
                              <IconButton
                                 onClick={handleClick}
                                 sx={styles.addToCalendarIconBtn}
                                 // variant="outlined"
                                 size="large"
                              >
                                 <CalendarIcon />
                              </IconButton>
                           </Tooltip>
                        )}
                     </AddToCalendar>
                  </Hidden>
               </Box>
               <Divider sx={styles.divider} />

               <TimerText time={time} />
            </Grid>
            <Grid item xs={12}>
               <Button
                  id="register-button"
                  color={registered ? "secondary" : "primary"}
                  variant={"contained"}
                  fullWidth
                  startIcon={registered && <CheckIcon />}
                  disabled={disabled || registered}
                  onClick={onRegisterClick}
                  disableElevation
                  data-testid="livestream-registration-button"
                  size="large"
               >
                  {registerButtonLabel}
               </Button>
            </Grid>
            <Hidden smUp>
               <Grid item xs={12}>
                  {streamIsOld(stream.start) ? (
                     ""
                  ) : (
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

                        <AddToCalendar
                           event={event}
                           filename={`${stream.company}-event`}
                        >
                           {(handleClick) => (
                              <Tooltip
                                 arrow
                                 placement="top"
                                 title={"Add to calendar"}
                              >
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

export default CountDown

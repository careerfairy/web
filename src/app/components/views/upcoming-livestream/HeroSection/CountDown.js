import React, { memo, useEffect, useMemo, useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import {
   Box,
   Button,
   Collapse,
   Divider,
   Grid,
   Hidden,
   IconButton,
   Paper,
   Tooltip,
   Typography,
} from "@mui/material";
import DateUtil from "../../../../util/DateUtil";
import CheckIcon from "@mui/icons-material/Check";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import { useRouter } from "next/router";
import { AddToCalendar } from "../../common/AddToCalendar";
import { Alert } from '@mui/material';

const useStyles = makeStyles((theme) => ({
   root: {
      padding: theme.spacing(2),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
         padding: theme.spacing(3),
      },
      borderRadius: theme.spacing(1),
   },
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
   attendBtn: ({ registered }) => ({
      "&:disabled": {
         color: registered && theme.palette.common.white,
         backgroundColor: registered && theme.palette.secondary.main,
      },
   }),
   dateTimeWrapper: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "nowrap",
      alignItems: "center",
   },
   dateTime: {
      fontWeight: 500,
   },
   streamStartingNoticeWrapper: {
      paddingBottom: theme.spacing(1),
      [theme.breakpoints.up("sm")]: {
         paddingBottom: theme.spacing(2),
      },
   },
   alert: {
      borderRadius: theme.spacing(1),
   },
   addToCalendarIconBtn: {
      border: `1px solid ${theme.palette.text.secondary}`,
      borderRadius: theme.spacing(0.5),
   },
   addToCalendarBtn: {},
   divider: {
      margin: theme.spacing(1, 0),
   },
}));

const TimerText = memo(({ time }) => {
   const classes = useStyles();
   const calculateTimeLeft = () => {
      const difference = time - new Date();
      let timeLeft = {};

      if (difference > 0) {
         timeLeft = {
            Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            Minutes: Math.floor((difference / 1000 / 60) % 60),
            Seconds: Math.floor((difference / 1000) % 60),
         };
      }

      return timeLeft;
   };

   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

   useEffect(() => {
      const timeout = setTimeout(() => {
         setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearTimeout(timeout);
   });
   return (
      <div className={classes.countDownWrapper}>
         {Object.keys(timeLeft).map((interval, index) => (
            <div key={index} className={classes.timeElement}>
               <Typography variant="h3" className={classes.timeLeft}>
                  {timeLeft[interval]}
               </Typography>
               <Typography variant="body1" className={classes.timeType}>
                  {interval}
               </Typography>
            </div>
         ))}
      </div>
   );
});

const CountDown = ({
   time,
   registerButtonLabel,
   disabled,
   onRegisterClick,
   registered,
   stream,
   streamAboutToStart,
}) => {
   const classes = useStyles({ registered });

   const {
      query: { livestreamId, groupId },
   } = useRouter();
   const event = useMemo(() => {
      const linkToStream = `https://careerfairy.io/upcoming-livestream/${livestreamId}${
         groupId ? `?groupId=${groupId}` : ""
      }`;
      return {
         name: stream.title,
         details: `Here is your Link: ${linkToStream}`,
         location: "Hosted virtually on CareerFairy (link in the description)",
         startsAt: new Date(stream.startDate).toISOString(),
         endsAt: new Date(
            new Date(stream.startDate).getTime() +
               1 * (stream.duration || 45) * 60 * 1000
         ).toISOString(),
      };
   }, [stream, livestreamId, groupId]);

   return (
      <Paper className={classes.root}>
         <Grid container spacing={2}>
            <Grid item xs={12}>
               <Collapse in={streamAboutToStart}>
                  <Box className={classes.streamStartingNoticeWrapper}>
                     <Alert
                        className={classes.alert}
                        variant="standard"
                        severity="info"
                     >
                        PLEASE WAIT HERE! YOU WILL BE REDIRECTED WHEN THE STREAM
                        STARTS.
                     </Alert>
                  </Box>
               </Collapse>
               <div className={classes.dateTimeWrapper}>
                  <Typography
                     align="center"
                     className={classes.dateTime}
                     variant="h6"
                  >
                     {DateUtil.getUpcomingDate(time)}
                  </Typography>
                  <Hidden smDown>
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
                                 className={classes.addToCalendarIconBtn}
                                 variant="outlined"
                                 size="large">
                                 <CalendarIcon />
                              </IconButton>
                           </Tooltip>
                        )}
                     </AddToCalendar>
                  </Hidden>
               </div>
               <Divider className={classes.divider} />

               <TimerText time={time} />
            </Grid>
            <Hidden smUp>
               <Grid item xs={12}>
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
                              className={classes.addToCalendarBtn}
                              startIcon={<CalendarIcon />}
                           >
                              ADD TO CALENDAR
                           </Button>
                        </Tooltip>
                     )}
                  </AddToCalendar>
               </Grid>
            </Hidden>
            <Grid item xs={12}>
               <Button
                  id="register-button"
                  className={classes.attendBtn}
                  color={registered ? "secondary" : "primary"}
                  variant={"contained"}
                  fullWidth
                  startIcon={registered && <CheckIcon />}
                  disabled={disabled || registered}
                  onClick={onRegisterClick}
                  disableElevation
                  size="large"
               >
                  {registerButtonLabel}
               </Button>
            </Grid>
         </Grid>
      </Paper>
   );
};

export default CountDown;

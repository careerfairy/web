import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Button,
   Divider,
   Grid,
   Hidden,
   IconButton,
   Paper,
   Tooltip,
   Typography,
} from "@material-ui/core";
import DateUtil from "../../../../util/DateUtil";
import CheckIcon from "@material-ui/icons/Check";
import CalendarIcon from "@material-ui/icons/CalendarToday";

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
         backgroundColor: registered && theme.palette.primary.main,
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
   addToCalendarIconBtn: {
      border: `1px solid ${theme.palette.text.secondary}`,
      borderRadius: theme.spacing(0.5),
   },
   addToCalendarBtn: {},
   divider: {
      margin: theme.spacing(1, 0),
   },
}));
const CountDown = ({
   time,
   registerButtonLabel,
   disabled,
   onRegisterClick,
   registered,
   handleAddToCalendar,
}) => {
   const classes = useStyles({ registered });

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
      <Paper className={classes.root}>
         <Grid container spacing={2}>
            <Grid item xs={12}>
               <div className={classes.dateTimeWrapper}>
                  <Typography
                     align="center"
                     className={classes.dateTime}
                     variant="h6"
                  >
                     {DateUtil.getUpcomingDate(time)}
                  </Typography>
                  <Hidden xsDown>
                     <Tooltip arrow placement="top" title={"Add to calendar"}>
                        <IconButton
                           onClick={handleAddToCalendar}
                           className={classes.addToCalendarIconBtn}
                           variant="outlined"
                        >
                           <CalendarIcon />
                        </IconButton>
                     </Tooltip>
                  </Hidden>
               </div>
               <Divider className={classes.divider} />
               <div className={classes.countDownWrapper}>
                  {Object.keys(timeLeft).map((interval, index) => (
                     <div key={index} className={classes.timeElement}>
                        <Typography variant="h3" className={classes.timeLeft}>
                           {timeLeft[interval]}
                        </Typography>
                        <Typography
                           variant="body1"
                           className={classes.timeType}
                        >
                           {interval}
                        </Typography>
                     </div>
                  ))}
               </div>
            </Grid>
            <Hidden smUp>
               <Grid item xs={12}>
                  <Button
                     onClick={handleAddToCalendar}
                     variant="outlined"
                     fullWidth
                     size="large"
                     className={classes.addToCalendarBtn}
                     startIcon={<CalendarIcon />}
                  >
                     ADD TO CALENDAR
                  </Button>
               </Grid>
            </Hidden>
            <Grid item xs={12}>
               <Button
                  className={classes.attendBtn}
                  color="primary"
                  variant="contained"
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

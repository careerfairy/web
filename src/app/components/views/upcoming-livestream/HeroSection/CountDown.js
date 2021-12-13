import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, Paper, Typography } from "@material-ui/core";
import DateUtil from "../../../../util/DateUtil";
import CheckIcon from "@material-ui/icons/Check";

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
      marginTop: theme.spacing(2),
      "&:disabled": {
         color: registered && theme.palette.common.white,
         backgroundColor: registered && theme.palette.primary.main,
      },
   }),
   dateTime: {
      fontWeight: 500,
   },
}));
const CountDown = ({
   time,
   registerButtonLabel,
   disabled,
   onRegisterClick,
   registered,
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
      <Grid container spacing={3}>
         <Grid item xs={12}>
            <Typography
               align="center"
               className={classes.dateTime}
               variant="h3"
            >
               {DateUtil.getUpcomingDate(time)}
            </Typography>
         </Grid>
         <Grid item xs={12}>
            <Paper className={classes.root}>
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
            </Paper>
         </Grid>
      </Grid>
   );
};

export default CountDown;

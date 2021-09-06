import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import dayjs from "dayjs";

const useStyles = makeStyles((theme) => {
   return {
      timePickerRoot: {
         display: "flex",
         width: "100%",
         height: "100%",
         minHeight: 100,
         color: theme.palette.common.white,
      },
      dateWrapper: {
         minWidth: 100,
         paddingLeft: theme.spacing(2),
         flex: 1,
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         border: "",
      },
      timeWrapper: {
         paddingLeft: theme.spacing(1),
         paddingRight: theme.spacing(2),
         flex: 1,
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
         "& p": {
            color: "white !important",
         },
      },
      dateTimeWrapper: {
         position: "relative",
         zIndex: "100",
         borderRadius: "5px",
         textAlign: "center",
         backgroundColor: theme.palette.common.white,
         boxShadow: theme.shadows[3],
         fontWeight: "500",
         textTransform: "uppercase",
         padding: "5px 15px",
         width: "400",
      },
      dateTimeWrapperMonth: {
         fontSize: "1.2rem",
         fontWeight: "300",
      },
      dateTimeWrapperDay: {
         fontSize: "2rem",
         lineHeight: "1.8rem",
      },
      dateTimeWrapperHour: {
         fontSize: "1.1rem",
         lineHeight: "1.6rem",
      },
      yearLabel: {
         width: "100%",
      },
      dateLabel: {
         width: "100%",
      },
      hourText: {
         display: "flex",
         alignItems: "baseline",
         fontSize: ({ mobile }) => mobile && theme.spacing(6),
      },
      amPmText: {
         marginLeft: theme.spacing(0.5),
      },
      yearText: {
         fontSize: ({ mobile }) => mobile && theme.spacing(2),
      },
      dayText: {
         fontSize: ({ mobile }) => mobile && theme.spacing(5),
      },
   };
});

export const DateDisplay = ({ date, narrow, mobile }) => {
   const classes = useStyles({ mobile });
   const year = dayjs(date).format("YYYY");
   const month = dayjs(date).format("MMM");
   const dayOfWeek = dayjs(date).format("ddd");
   const dayOfMonth = dayjs(date).format("D");

   return (
      <div className={classes.dateWrapper}>
         <Typography
            className={classes.yearText}
            variant={narrow ? "h6" : "h5"}
         >
            {year}
         </Typography>
         <Typography
            gutterBottom
            className={classes.dayText}
            variant={narrow ? "h4" : "h3"}
         >
            {`${month} ${dayOfMonth}`}
         </Typography>
      </div>
   );
};

export const TimeDisplay = ({ date, narrow, mobile }) => {
   const classes = useStyles({ mobile });

   const hour = dayjs(date).format("hh");
   const minute = dayjs(date).format("mm");
   const amPm = dayjs(date).format("A");
   return (
      <div className={classes.timeWrapper}>
         <Typography
            gutterBottom
            className={classes.hourText}
            variant={narrow ? "h3" : "h2"}
         >
            {`${hour}:${minute}`}
            <Typography className={classes.amPmText}>{amPm}</Typography>
         </Typography>
      </div>
   );
};

export const DateTimeDisplay = ({ date, narrow, mobile }) => {
   const classes = useStyles({ mobile });

   const month = dayjs(date).format("MMM");
   const dayOfMonth = dayjs(date).format("D");

   const hour = dayjs(date).format("HH");
   const minute = dayjs(date).format("mm");
   const amPm = dayjs(date).format("A");

   return (
      <div className={classes.dateTimeWrapper}>
         <div className={classes.content}>
            <div className={classes.dateTimeWrapperMonth}>{month}</div>
            <div className={classes.dateTimeWrapperDay}>{dayOfMonth}</div>
            <div className={classes.dateTimeWrapperHour}>
               {hour}:{minute}
            </div>
         </div>
      </div>
   );
};

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
      // backgroundColor: theme.palette.common.white,
      // boxShadow: theme.shadows[3],
      fontWeight: "500",
      // textTransform: "uppercase",
      padding: "5px 15px",
      width: "400",
      color: theme.palette.common.white,
    },
    dateTimeWrapperMonth: {
      fontSize: `1.1rem`,
      fontWeight: 300,
      textAlign: "left",
    },
    dateTimeWrapperDay: {
      fontSize: `2.9rem`,
      fontWeight: 400,
      lineHeight: "3.1rem",
      textAlign: "left",
    },
    dateTimeWrapperHour: {
      fontWeight: 500,
      fontSize: `1.5rem`,
      // lineHeight: "1.6rem",
      textAlign: "left",
      "& span":{
      fontSize: `0.8em`,
        opacity: 0.5
      }
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

export const EmbedTimeDisplay = ({ date, narrow, mobile }) => {
  const classes = useStyles({ mobile });

  const month = dayjs(date).format("MMM");
  console.log("-> month", month);
  const dayOfMonth = dayjs(date).format("D");

  const hour = dayjs(date).format("HH");
  const minute = dayjs(date).format("mm");
  const amPm = dayjs(date).format("A");

  return (
    <div className={classes.dateTimeWrapper}>
      <div className={classes.content}>
        <Typography className={classes.dateTimeWrapperMonth}>{month}</Typography>
        <Typography className={classes.dateTimeWrapperDay}>{dayOfMonth}</Typography>
        <Typography className={classes.dateTimeWrapperHour}>
          {hour}
          <span >{minute}</span>
        </Typography>
      </div>
    </div>
  );
};

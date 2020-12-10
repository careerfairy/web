import {makeStyles, Typography} from "@material-ui/core";
import React from "react";
import dayjs from "dayjs";


const useStyles = makeStyles(theme => {

    return {
        timePickerRoot: {
            display: "flex",
            width: "100%",
            height: "100%",
            minHeight: 100,
            color: theme.palette.common.white
        },
        dateWrapper: {
            minWidth: 100,
            paddingLeft: theme.spacing(2),
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            border: ""
        },
        timeWrapper: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(2),
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            "& p": {
                color: "white !important"
            },
        },
        yearLabel: {
            width: "100%"
        },
        dateLabel: {
            width: "100%"
        },
        hourText: {
            display: "flex",
            alignItems: "baseline",
            fontSize: ({mobile}) => mobile && theme.spacing(6)
        },
        amPmText: {
            marginLeft: theme.spacing(0.5),
        },
        yearText:{
            fontSize: ({mobile}) => mobile && theme.spacing(4)

        },
        dayText:{
            fontSize: ({mobile}) => mobile && theme.spacing(5)

        }
    }
})

export const DateDisplay = ({date, narrow, mobile}) => {
    const classes = useStyles({mobile})
    const year = dayjs(date).format('YYYY')
    const month = dayjs(date).format('MMM')
    const dayOfWeek = dayjs(date).format('ddd')
    const dayOfMonth = dayjs(date).format('D')

    return (
        <div className={classes.dateWrapper}>
            <Typography className={classes.yearText} variant={narrow ? "h5" : "h4"}>
                {year}
            </Typography>
            <Typography gutterBottom className={classes.dayText} variant={narrow ? "h4" : "h3"}>
                {`${dayOfWeek}, ${month} ${dayOfMonth}`}
            </Typography>
        </div>
    )
}

export const TimeDisplay = ({date, narrow, mobile}) => {
    const classes = useStyles({mobile})

    const hour = dayjs(date).format('hh')
    const minute = dayjs(date).format('mm')
    const amPm = dayjs(date).format('A')
    return (
        <div className={classes.timeWrapper}>
            <Typography gutterBottom className={classes.hourText} variant={narrow ? "h3" : "h2"}>
                {`${hour}:${minute}`}
                <Typography className={classes.amPmText}>
                    {amPm}
                </Typography>
            </Typography>
        </div>
    )
}


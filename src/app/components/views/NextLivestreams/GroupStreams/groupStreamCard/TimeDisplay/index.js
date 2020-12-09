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
            minWidth:100,
            paddingLeft: theme.spacing(2),
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
        },
        timeWrapper: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(2),
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        yearLabel: {
            width: "100%"
        },
        dateLabel: {
            width: "100%"
        },
        hour: {
            display: "flex",
            alignItems: "baseline"
        },
        amPm: {
            marginLeft: theme.spacing(1)
        }
    }
})

export const DateDisplay = ({date}) => {
    const classes = useStyles()
    const year = dayjs(date).format('YYYY')
    const month = dayjs(date).format('MMM')
    const dayOfWeek = dayjs(date).format('ddd')
    const dayOfMonth = dayjs(date).format('D')

    return (
        <div className={classes.dateWrapper}>
            <Typography variant="h6">
                {year}
            </Typography>
            <Typography variant="h5">
                {`${dayOfWeek}, ${month} ${dayOfMonth}`}
            </Typography>
        </div>
    )
}

export const TimeDisplay = ({date}) => {
    const classes = useStyles()

    const hour = dayjs(date).format('hh')
    const minute = dayjs(date).format('mm')
    const amPm = dayjs(date).format('A')
    return (
        <div className={classes.timeWrapper}>
            <Typography gutterBottom={false} className={classes.hour} variant="h1">
                {`${hour}:${minute}`}
                <Typography className={classes.amPm} variant="h6">
                    {amPm}
                </Typography>
            </Typography>
        </div>
    )
}


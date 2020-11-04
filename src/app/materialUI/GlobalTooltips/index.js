import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {Button} from "@material-ui/core";

const useStyles = makeStyles(theme => {
    return {
        tooltip: {
            backgroundColor: theme.palette.common.white,
            color: theme.palette.common.black,
            boxShadow: theme.shadows[1],
            fontSize: 11,
            padding: theme.spacing(2)
        },
        arrow: {
            color: theme.palette.common.white,
        },
        title: {
            fontWeight: 600,
            fontSize: "1rem"
        },
        text: {},
        buttonWrapper: {
            marginTop: theme.spacing(1),
            width: "100%",
            display: "flex",
            justifyContent: "flex-end"
        },
        "@keyframes blink": {
            "50%": {
                borderColor: theme.palette.secondary.main
            }
        },
        highlight: {
            borderRadius: 10,
            border: "4px solid transparent",
            animation: "$blink .5s step-end infinite alternate",
        }
    }
})
//
export const WhiteTooltip = (
    {
        title,
        children,
        open,
        ...props
    }) => {

    const classes = useStyles()

    return (
        <Tooltip
            arrow
            open={open}
            interactive
            {...props}
            classes={{arrow: classes.arrow, tooltip: classes.tooltip}}
            title={title}>
            <div className={open ? classes.highlight : {}}>
                {children}
            </div>
        </Tooltip>
    )
}

export const TooltipTitle = ({children, ...props}) => {
    const classes = useStyles()
    return (
        <Typography gutterBottom className={classes.title} {...props}>
            {children}
        </Typography>
    )
}

export const TooltipText = ({children, ...props}) => {
    const classes = useStyles()
    return (
        <Typography className={classes.text} {...props}>
            {children}
        </Typography>
    )
}

export const TooltipButtonComponent = ({onConfirm, buttonText = "Ok", ...props}) => {
    const classes = useStyles()
    return (
        <div className={classes.buttonWrapper} {...props}>
            <Button color="primary" size="small" variant="contained" onClick={onConfirm}>
                {buttonText}
            </Button>
        </div>
    )
}
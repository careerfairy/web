import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
    return {
        root: {
            backgroundColor: theme.palette.common.white,
            color: theme.palette.common.black,
            boxShadow: theme.shadows[1],
            fontSize: 11,
        },
        arrow: {
            backgroundColor: theme.palette.common.white,
            boxShadow: theme.shadows[1],
        }
    }
})

export const WhiteTooltip = (
    {
        title,
        children,
        ...props
    }) => {

    const classes = useStyles()

    return (
        <Tooltip
            {...props}
            classes={{arrow: classes.arrow}}
            className={classes.root}
            title={title}>
            {children}
        </Tooltip>
    )
}
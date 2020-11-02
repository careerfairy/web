import IconButton from "@material-ui/core/IconButton";
import ChevronRightRoundedIcon from "@material-ui/icons/ChevronRightRounded";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {fade} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
    sendIcon: {
        background: "white",
        color: ({isEmpty}) => isEmpty ? "grey" : theme.palette.primary.main,
        borderRadius: "50%",
        fontSize: 15
    },
    sendBtn: {
        width: 30,
        height: 30,
        background: fade(theme.palette.primary.main, 0.5),
        "&$buttonDisabled": {
            color: grey[800]
        },
        "&:hover": {
            backgroundColor: theme.palette.primary.main,
        },
        margin: "0.5rem"
    },
    buttonDisabled: {},
}))

export const PlayIconButton = ({addNewComment, isEmpty, IconProps, IconButtonProps, ...props}) => {
    const classes = useStyles({isEmpty})

    return (
        <div {...props}>
            <IconButton
                {...IconButtonProps}
                classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}}
                disabled={isEmpty}
                onClick={() => addNewComment()}>
                <ChevronRightRoundedIcon
                    {...IconProps}
                    className={classes.sendIcon}/>
            </IconButton>
        </div>
    )
}
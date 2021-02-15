import React from 'react';
import {fade, makeStyles} from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';

const useStyles = makeStyles(theme => ({
    glass: {
        backgroundColor: theme.palette.type === "dark" ? fade(theme.palette.common.black, 0.4) : theme.palette.background.default,
        backdropFilter: "blur(5px)",
    }
}));

export const GlassDialog = ({PaperProps, ...rest}) => {
    const classes = useStyles()
    return (
        <Dialog PaperProps={{...PaperProps, className: classes.glass}} {...rest}/>
    );
};

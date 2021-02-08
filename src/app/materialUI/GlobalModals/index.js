import React from 'react';
import {fade, makeStyles} from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';

const useStyles = makeStyles(theme => ({
    glass:{
        backgroundColor: fade(theme.palette.common.black, 0.4),
        backdropFilter: "blur(5px)",
    }
}));

export const GlassDialog = ({...rest}) => {
    const classes = useStyles()
    return (
        <Dialog PaperProps={{className: classes.glass}} {...rest}/>
    );
};

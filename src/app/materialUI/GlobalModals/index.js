import React from 'react';
import {fade, makeStyles} from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';
import PropTypes from "prop-types";

const useStyles = makeStyles(theme => ({
    glass: {
        backgroundColor: theme.palette.type === "dark" ? fade(theme.palette.common.black, 0.4) : theme.palette.background.default,
        backdropFilter: "blur(5px)",
    }
}));

const GlassDialog = (props) => {
    const {PaperProps, ...rest} = props
    const classes = useStyles()
    return (
        <Dialog PaperProps={{...PaperProps, className: classes.glass}} {...rest}/>
    );
};

GlassDialog.prototypes = {
    open: PropTypes.bool.isRequired,
    className: PropTypes.string,
    fullScreen: PropTypes.bool,
    fullWidth: PropTypes.bool,
    maxWidth: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs', false]),
    onBackdropClick: PropTypes.func,
    onClose: PropTypes.func,
    PaperProps: PropTypes.object,
    scroll: PropTypes.oneOf(['body', 'paper']),
    TransitionComponent: PropTypes.node,
    disableBackdropClick: PropTypes.bool,
    disableEscapeKeyDown: PropTypes.bool,
    classes: PropTypes.object,
    TransitionProps: PropTypes.node
}

GlassDialog.defaultProps = {
};
export {GlassDialog}
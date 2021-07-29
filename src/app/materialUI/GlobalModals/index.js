import PropTypes from 'prop-types'
import React from 'react';
import {alpha, makeStyles} from "@material-ui/core/styles";
import {Dialog} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    glass: {
        backgroundColor: theme.palette.type === "dark" ? alpha(theme.palette.common.black, 0.4) : theme.palette.background.default,
        backdropFilter: "blur(5px)",
    }
}));

const GlassDialog = ({
                         open,
                         PaperProps,
                         className,
                         fullWidth,
                         maxWidth,
                         onBackdropClick,
                         onClose,
                         scroll,
                         TransitionComponent,
                         disableBackdropClick,
                         classes,
                         TransitionProps,
                         ...rest
                     }) => {
    const paperClasses = useStyles()
    return (
        <Dialog
            PaperProps={{...PaperProps, className: paperClasses.glass}}
            open={open}
            className={className}
            fullWidth={fullWidth}
            maxWidth={maxWidth}
            onBackdropClick={onBackdropClick}
            onClose={onClose}
            scroll={scroll}
            TransitionComponent={TransitionComponent}
            disableBackdropClick={disableBackdropClick}
            classes={classes}
            TransitionProps={TransitionProps}
            {...rest}
        />
    );
};

GlassDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    className: PropTypes.string,
    fullScreen: PropTypes.bool,
    fullWidth: PropTypes.bool,
    maxWidth: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs', false]),
    onBackdropClick: PropTypes.func,
    onClose: PropTypes.func,
    PaperProps: PropTypes.object,
    scroll: PropTypes.oneOf(['body', 'paper']),
    TransitionComponent: PropTypes.object,
    disableBackdropClick: PropTypes.bool,
    disableEscapeKeyDown: PropTypes.bool,
    classes: PropTypes.object,
    TransitionProps: PropTypes.object
}
export {GlassDialog}


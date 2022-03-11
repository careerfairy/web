import PropTypes from "prop-types";
import React from "react";
import { alpha } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { Dialog } from "@mui/material";

const useGlassStyles = makeStyles((theme) => ({
   glass: {
      backgroundColor: (props) => {
         return theme.palette.mode === "dark" || props.forceGlass
            ? alpha(theme.palette.common.black, 0.8)
            : theme.palette.background.default;
      },
      backdropFilter: "blur(5px)",
   },
}));

const GlassDialog = ({
   open = false,
   PaperProps = {},
   className = "",
   fullWidth = false,
   maxWidth = undefined,
   onBackdropClick = undefined,
   onClose = undefined,
   scroll = undefined,
   TransitionComponent = undefined,
   disableBackdropClick = undefined,
   classes = undefined,
   TransitionProps = undefined,
   forceGlass = undefined,
   ...rest
}) => {
   const paperClasses = useGlassStyles();
   return (
      <Dialog
         PaperProps={{ ...PaperProps, className: paperClasses.glass }}
         open={open}
         className={className}
         fullWidth={fullWidth}
         maxWidth={maxWidth}
         onBackdropClick={onBackdropClick}
         onClose={onClose}
         scroll={scroll}
         TransitionComponent={TransitionComponent}
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
   maxWidth: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs", false]),
   onBackdropClick: PropTypes.func,
   onClose: PropTypes.func,
   PaperProps: PropTypes.object,
   scroll: PropTypes.oneOf(["body", "paper"]),
   TransitionComponent: PropTypes.object,
   disableBackdropClick: PropTypes.bool,
   disableEscapeKeyDown: PropTypes.bool,
   classes: PropTypes.object,
   TransitionProps: PropTypes.object,
   forceGlass: PropTypes.bool,
};
export { GlassDialog, useGlassStyles };

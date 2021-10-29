import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import SettingsIcon from "@material-ui/icons/Settings";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PropTypes from "prop-types";
import { Box, Collapse } from "@material-ui/core";
import ButtonWithHint from "./ButtonWithHint";

const useStyles = makeStyles((theme) => ({
   root: {
      // color: theme.palette.text.secondary,
   },
   btn: {
      whiteSpace: "nowrap",
   },
   icon: {
      transform: "rotate(0deg)",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.shortest,
      }),
   },
   iconHovered: {
      transform: "rotate(180deg)",
   },
   streamActionButton: {
      marginTop: theme.spacing(0.5),
   },
   numberOfRegisteredBtn: {
      background: "transparent",
      marginBottom: theme.spacing(0.5),
      cursor: "default",
      "&:hover": {
         background: "transparent",
      },
   },
}));
const ManageStreamActions = ({
   actions,
   isHighlighted,
   setTargetStream,
   rowData,
   numberOfRegisteredUsers,
}) => {
   const classes = useStyles();
   const [open, setOpen] = useState(false);

   useEffect(() => {
      if (isHighlighted) {
         handleOpen();
      }
   }, [isHighlighted]);

   const handleOpen = () => {
      setTargetStream(rowData);
      setOpen(true);
   };
   const handleClose = () => {
      // setTargetStream(null);
      setOpen(false);
   };

   const toggle = () => {
      if (open) handleClose();
      if (!open) handleOpen();
   };
   return (
      <Box display="flex" flexDirection="column" height="100%" minWidth={300}>
         {numberOfRegisteredUsers !== undefined && (
            <Button
               className={clsx(classes.btn, classes.numberOfRegisteredBtn)}
               disableElevation
               disableRipple
               variant="outlined"
               color="secondary"
               disableFocusRipple
               size="large"
            >
               {numberOfRegisteredUsers} - Registrations
            </Button>
         )}
         <Button
            className={clsx(classes.root, classes.btn)}
            fullWidth
            size="large"
            disableElevation
            variant="contained"
            color="inherit"
            onClick={toggle}
            startIcon={<SettingsIcon />}
            endIcon={
               <ExpandMoreIcon
                  className={clsx(classes.icon, {
                     [classes.iconHovered]: open,
                  })}
               />
            }
         >
            {open ? "Show Less" : "Manage stream"}
         </Button>
         <Collapse mountOnEnter in={open}>
            {actions
               .filter((action) => !action.hidden)
               .map((action) =>
                  action.loadedButton ? (
                     <React.Fragment key={action.tooltip}>
                        {action.loadedButton}
                     </React.Fragment>
                  ) : (
                     <ButtonWithHint
                        className={classes.streamActionButton}
                        hintTitle={action.hintTitle}
                        variant={action.variant}
                        color={action.color}
                        hintDescription={action.hintDescription}
                        startIcon={action.icon}
                        key={action.tooltip}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        fullWidth
                     >
                        {action.tooltip}
                     </ButtonWithHint>
                  )
               )}
         </Collapse>
      </Box>
   );
};

ManageStreamActions.propTypes = {
   actions: PropTypes.array,
};
export default ManageStreamActions;

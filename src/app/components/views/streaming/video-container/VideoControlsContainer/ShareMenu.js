import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   Popover,
} from "@material-ui/core";
import { StyledTooltipWithButton } from "../../../../../materialUI/GlobalTooltips";

const useStyles = makeStyles((theme) => ({
   list: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
   },
   listIconWrapper: {
      minWidth: "auto",
      paddingRight: theme.spacing(2),
   },
}));

const ShareItem = ({
   disabled,
   name,
   onClick,
   listIconWrapperClassName,
   icon,
   isCtaTutorialButton,
   handleConfirmTutorialStep,
}) => {
   const item = (
      <ListItem key={name} disabled={disabled} onClick={onClick} button>
         <ListItemIcon className={listIconWrapperClassName}>
            {icon}
         </ListItemIcon>
         <ListItemText primary={name} />
      </ListItem>
   );

   return isCtaTutorialButton ? (
      <StyledTooltipWithButton
         open={isCtaTutorialButton}
         buttonText="ok"
         tooltipTitle="Share Job Posts (1/5)"
         placement="left"
         onConfirm={handleConfirmTutorialStep}
         tooltipText="Click here to share your job posts or social media channels."
      >
         {item}
      </StyledTooltipWithButton>
   ) : (
      item
   );
};

const ShareMenu = ({
   anchorEl,
   onClose,
   shareActions,
   isOpen,
   handleConfirm,
   handleOpenCallToActionDrawer,
}) => {
   const classes = useStyles();
   const open = Boolean(anchorEl);

   return (
      <Popover
         open={open || isOpen(17)}
         anchorEl={anchorEl}
         onClose={isOpen(17) ? () => {} : onClose}
         anchorOrigin={{
            vertical: "center",
            horizontal: "left",
         }}
         transformOrigin={{
            vertical: "center",
            horizontal: "right",
         }}
      >
         <List dense className={classes.list}>
            {shareActions.map((action) => {
               const isCtaTutorialButton =
                  isOpen(17) && action.id === "sendCtaAction";
               return (
                  <ShareItem
                     onClick={() => {
                        if (isCtaTutorialButton) {
                           handleConfirm(17);
                        }
                        action.onClick();
                        onClose();
                     }}
                     isCtaTutorialButton={isCtaTutorialButton}
                     handleConfirmTutorialStep={() => {
                        handleConfirm(17);
                        handleOpenCallToActionDrawer();
                        onClose();
                     }}
                     name={action.name}
                     icon={action.icon}
                     listIconWrapperClassName={classes.listIconWrapper}
                     disabled={!isCtaTutorialButton}
                  />
               );
            })}
         </List>
      </Popover>
   );
};

ShareMenu.propTypes = {
   anchorEl: PropTypes.object,
   onClose: PropTypes.func,
   shareActions: PropTypes.arrayOf(
      PropTypes.shape({
         icon: PropTypes.node,
         name: PropTypes.string,
         onClick: PropTypes.func,
      })
   ),
};
ShareMenu.defaultProps = {
   shareActions: [],
};
export default ShareMenu;

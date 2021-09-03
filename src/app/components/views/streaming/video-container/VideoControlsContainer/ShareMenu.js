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
import {
   StyledTooltipWithButton,
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../materialUI/GlobalTooltips";

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
         <StyledTooltipWithButton
            open={isOpen(17)}
            buttonText="ok"
            tooltipTitle="Share Job Posts (1/5)"
            placement="left"
            onConfirm={() => {
               handleConfirm(17);
               handleOpenCallToActionDrawer();
               onClose();
            }}
            tooltipText="Click here to share your job posts or social media channels."
         >
            <List dense className={classes.list}>
               {shareActions.map((action) => {
                  const isCtaTutorialButton =
                     isOpen(17) && action.id === "sendCtaAction";
                  return (
                     <ListItem
                        key={action.name}
                        disabled={!isCtaTutorialButton}
                        onClick={() => {
                           if (isCtaTutorialButton) {
                              handleConfirm(17);
                           }
                           action.onClick();
                           onClose();
                        }}
                        button
                     >
                        <ListItemIcon className={classes.listIconWrapper}>
                           {action.icon}
                        </ListItemIcon>
                        <ListItemText primary={action.name} />
                     </ListItem>
                  );
               })}
            </List>
         </StyledTooltipWithButton>
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

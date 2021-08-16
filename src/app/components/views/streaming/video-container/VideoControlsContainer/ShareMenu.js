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

const useStyles = makeStyles((theme) => ({
   list: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
   },
  listIconWrapper:{
     minWidth: "auto",
    paddingRight: theme.spacing(2)
  }
}));

const ShareMenu = ({ anchorEl, onClose, shareActions }) => {
   const classes = useStyles();
   const open = Boolean(anchorEl);

   return (
      <Popover
         open={open}
         anchorEl={anchorEl}
         onClose={onClose}
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
            {shareActions.map((action) => (
               <ListItem
                 key={action.name}
                  onClick={() => {
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
            ))}
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


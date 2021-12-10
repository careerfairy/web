import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Menu, MenuItem } from "@material-ui/core";
import ButtonWithHint from "./ButtonWithHint";

const useStyles = makeStyles((theme) => ({
   root: {},
   btn: {
      marginTop: theme.spacing(0.5),
   },
}));

const MoreOptionsMenu = ({
   handleOpenEndOfEventDialog,
   rowData,
   hintTitle,
}) => {
   const classes = useStyles();
   const [anchorEl, setAnchorEl] = useState(null);
   const open = Boolean(anchorEl);
   const options = [
      {
         label: "Manage end of event",
         onClick: () => handleOpenEndOfEventDialog({ rowData }),
      },
   ];
   const handleClick = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };
   return (
      <>
         <ButtonWithHint
            className={classes.btn}
            onClick={handleClick}
            fullWidth
            hintTitle={hintTitle}
            variant="outlined"
            startIcon={<MoreVertIcon />}
         >
            More Options
         </ButtonWithHint>

         <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
         >
            {options.map((option) => (
               <MenuItem
                  key={option.label}
                  onClick={(e) => {
                     e.stopPropagation();
                     option.onClick();
                     handleClose();
                  }}
               >
                  {option.label}
               </MenuItem>
            ))}
         </Menu>
      </>
   );
};

export default MoreOptionsMenu;

import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Menu, MenuItem } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {},
}));

const MoreOptionsMenu = ({ handleOpenEndOfEventDialog, rowData }) => {
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
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };
   return (
      <>
         <MoreVertIcon onClick={handleClick} />
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
                  onClick={() => {
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

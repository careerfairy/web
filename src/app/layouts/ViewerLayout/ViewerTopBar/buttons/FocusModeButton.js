import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
// import FocusModeActiveIcon from "@material-ui/icons/Brightness2Outlined";
// import FocusInactiveIcon from "@material-ui/icons/Brightness2";
import FocusInactiveIcon from "@material-ui/icons/PersonalVideo";
import FocusModeActiveIcon from "@material-ui/icons/PersonalVideoTwoTone";
import * as actions from "store/actions";
import { useDispatch, useSelector } from "react-redux";

const FocusModeButton = () => {
   const focusModeEnabled = useSelector(
      (state) => state.stream.layout.focusModeEnabled
   );
   const dispatch = useDispatch();
   const toggleFocusMode = () => dispatch(actions.setFocusMode());

   return (
      <Tooltip title="Disable emotes and hide the ui element when not in use.">
         <IconButton
            color={focusModeEnabled ? "primary" : "default"}
            onClick={toggleFocusMode}
         >
            {focusModeEnabled ? <FocusModeActiveIcon /> : <FocusInactiveIcon />}
         </IconButton>
      </Tooltip>
   );
};

export default FocusModeButton;

import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@material-ui/core";
import FocusInactiveIcon from "@material-ui/icons/PersonalVideo";
import FocusModeActiveIcon from "@material-ui/icons/PersonalVideoTwoTone";
import * as actions from "store/actions";
import { useDispatch, useSelector } from "react-redux";

const FocusModeButton = ({ primary, mobile }) => {
   const focusModeEnabled = useSelector(
      (state) => state.stream.layout.focusModeEnabled
   );
   const dispatch = useDispatch();
   const toggleFocusMode = () => {
      dispatch(actions.setFocusMode(undefined, mobile));
   };

   return (
      <Tooltip
         title={`Press to ${
            focusModeEnabled ? "enable" : "disable"
         } emotes and hide the ui elements when not in use.`}
      >
         <IconButton
            color={focusModeEnabled || primary ? "primary" : "default"}
            onClick={toggleFocusMode}
         >
            {focusModeEnabled ? <FocusModeActiveIcon /> : <FocusInactiveIcon />}
         </IconButton>
      </Tooltip>
   );
};

FocusModeButton.propTypes = {
   primary: PropTypes.bool,
   mobile: PropTypes.bool,
};

export default FocusModeButton;

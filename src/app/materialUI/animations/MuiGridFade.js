import PropTypes from "prop-types";
import React from "react";
import Fade from "@stahl.luke/react-reveal/Fade";

const MuiGridFade = ({ index, maxDelay = 3000, ...props }) => {
   const delay = (index + 1) * 600;
   return <Fade up timeout={delay <= maxDelay ? delay : maxDelay} {...props} />;
};

MuiGridFade.propTypes = {
   index: PropTypes.number.isRequired,
};
export default MuiGridFade;

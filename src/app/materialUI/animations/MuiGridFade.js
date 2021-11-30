import PropTypes from "prop-types";
import React from "react";
import Fade from "react-reveal/Fade";

const MuiGridFade = ({ index, ...props }) => {
   return <Fade up timeout={(index + 1) * 600} {...props} />;
};

MuiGridFade.propTypes = {
   index: PropTypes.number.isRequired,
};
export default MuiGridFade;

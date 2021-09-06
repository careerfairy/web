import { Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

import React from "react";

const useStyles = makeStyles((theme) => ({
   panelContentWrapper: {
      display: "flex",
      alignItems: "center",
      "& img": {
         width: theme.spacing(3),
         height: theme.spacing(3),
      },
      "& > *": {
         margin: theme.spacing(0, 0.5),
      },
   },
}));
const PanelDisplay = ({ imageSrc, imageAlt, count }) => {
   const classes = useStyles();
   return (
      <div className={classes.panelContentWrapper}>
         <img src={imageSrc} alt={imageAlt} />
         <Typography>{count}</Typography>
      </div>
   );
};

PanelDisplay.propTypes = {
   count: PropTypes.number,
   imageAlt: PropTypes.string,
   imageSrc: PropTypes.string,
};

export default PanelDisplay;

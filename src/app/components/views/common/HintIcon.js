import { makeStyles } from "@material-ui/core/styles";
import { Tooltip, Typography } from "@material-ui/core";
import React from "react";
import HelpIcon from "@material-ui/icons/HelpOutlineOutlined";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
   root: {},
   tooltip: {
      padding: theme.spacing(2),
   },
   description: {
      fontSize: "0.85rem",
   },
   title: {
      fontSize: "0.875rem",
      textTransform: "uppercase",
      marginBottom: "0.3em",
      fontWeight: 500,
   },
}));

const HintIcon = ({ title, description }) => {
   const classes = useStyles();
   return (
      <Tooltip
         arrow
         classes={{
            tooltip: classes.tooltip,
         }}
         placement="right"
         title={
            <React.Fragment>
               <Typography className={classes.title}>{title}</Typography>
               <Typography className={classes.description} variant="body1">
                  {description}
               </Typography>
            </React.Fragment>
         }
      >
         <HelpIcon />
      </Tooltip>
   );
};

HintIcon.propTypes = {
   description: PropTypes.string,
   title: PropTypes.string,
};

export default HintIcon;

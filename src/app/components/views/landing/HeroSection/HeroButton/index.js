import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import RoundButton from "materialUI/GlobalButtons/RoundButton";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   heroBtnRoot: {
      position: "relative",
   },
   buttonBackgroundIcon: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: "50%",
      height: "auto",
      [theme.breakpoints.down("sm")]: {
         display: "none"
      }
   },
   heroBtn:{
      filter: "drop-shadow(17.092px 15.39px 36.5px rgba(125,84,242,0.51))",

   }
}));

const HeroButton = ({className, iconUrl, ...props }) => {
   const classes = useStyles();

   return (
      <div className={classes.heroBtnRoot}>
         {iconUrl && (
            <img
               className={classes.buttonBackgroundIcon}
               src={iconUrl}
               alt={props.children}
            />
         )}
         <RoundButton className={clsx(className, classes.heroBtn)} size="large" {...props} />
      </div>
   );
};

export default HeroButton;

HeroButton.propTypes = {
   icon: PropTypes.node,
};

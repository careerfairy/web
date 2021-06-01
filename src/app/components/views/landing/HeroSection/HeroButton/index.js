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
      height: "auto"
   },
   heroBtn:{
      filter: "drop-shadow(17.092px 15.39px 36.5px rgba(125,84,242,0.51))",
      margin: theme.spacing(2, 2, 2, 0),
      [theme.breakpoints.down("xs")]: {
      margin: theme.spacing(1, 1, 1, 0),
      }
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

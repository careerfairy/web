import PropTypes from "prop-types";
import React, { useMemo } from "react";
import { fade, makeStyles, useTheme } from "@material-ui/core/styles";
import RoundButton from "materialUI/GlobalButtons/RoundButton";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   heroBtnRoot: {
      position: "relative",
      width: "inherit",
   },
   buttonBackgroundIcon: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "50%",
      height: "auto",
      [theme.breakpoints.down("sm")]: {
         display: "none",
      },
   },
   heroBtn: {
      whiteSpace: "nowrap",
      [theme.breakpoints.down("md")]: {
         filter: (props) =>
           `drop-shadow(4.092px 4.39px 9.5px ${fade(
             props.buttonColor,
             0.7
           )})`,
      },
      filter: (props) =>
         `drop-shadow(17.092px 15.39px 36.5px ${fade(
            props.buttonColor,
            0.51
         )})`,
   },
}));

const HeroButton = ({ color, className, iconUrl, ...props }) => {
   const {
      palette: { primary, secondary, grey },
   } = useTheme();
   const buttonColor = useMemo(() => {
      if (color === "primary") return primary.main;
      if (color === "secondary") return secondary.main;
      return grey["300"];
   }, [color, primary, secondary, grey]);

   const classes = useStyles({ buttonColor });

   return (
      <div className={classes.heroBtnRoot}>
         {iconUrl && (
            <img
               className={classes.buttonBackgroundIcon}
               src={iconUrl}
               alt={props.children}
            />
         )}
         <RoundButton
            className={clsx(className, classes.heroBtn)}
            size="large"
            color={color}
            {...props}
         />
      </div>
   );
};

export default HeroButton;

HeroButton.propTypes = {
   icon: PropTypes.node,
};

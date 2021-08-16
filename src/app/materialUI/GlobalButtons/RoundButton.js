import PropTypes from "prop-types";
import React, { useMemo } from "react";
import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import clsx from "clsx";

const paddingSize = 4;
const paddingXFactor = 0.5;
const mobileFactor = 0.8;
const useStyles = makeStyles((theme) => ({
   root: {
      padding: `${paddingSize * paddingXFactor}em ${paddingSize}em`,
      borderRadius: `${paddingSize}em`,
      [theme.breakpoints.down("xs")]: {
         padding: `${paddingSize * paddingXFactor * mobileFactor}em ${
            paddingSize * mobileFactor
         }em`,
         borderRadius: `${paddingSize * mobileFactor}em`,
      },
   },
   withGradient: {
      background: (props) =>
         `linear-gradient(-24deg, ${props.colors[0]} 1%, ${props.colors[1]} 100%)`,
      color: theme.palette.common.white,
      "&:hover": {
         boxShadow: (props) => `0 3px 5px 2px  ${alpha(props.colors[1], 0.3)}`,
      },
   },
}));

const RoundButton = ({ withGradient, className, color, ...props }) => {
   const {
      palette: { primary, secondary, grey },
   } = useTheme();
   const colors = useMemo(() => {
      if (color === "primary") {
         return [primary.main, primary.gradient];
      }
      if (color === "secondary") {
         return [secondary.main, secondary.gradient];
      }

      return [grey["300"], grey["700"]];
   }, [color, primary, secondary, grey]);
   const classes = useStyles({ colors });

   return (
      <Button
         color={color}
         className={clsx(className, classes.root, {
            [classes.withGradient]: withGradient,
         })}
         {...props}
      />
   );
};

export default RoundButton;

RoundButton.propTypes = {
   className: PropTypes.string,
   withGradient: PropTypes.bool,
};

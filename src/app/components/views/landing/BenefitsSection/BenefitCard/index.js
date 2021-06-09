import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { Typography } from "@material-ui/core";

const angle = 20;
const rectLength = 150;
const useStyles = makeStyles((theme) => ({
   root: {
      // border: "1px solid red"
   },
   graphicContainer: {
      height: rectLength * 1.5,
      position: "relative",
   },
   primary: {
      backgroundImage: `linear-gradient(-8deg, ${theme.palette.primary.dark} 1%, ${theme.palette.primary.light} 100%)`,
      filter: "drop-shadow(21.632px 36.001px 24.5px rgba(189,243,236,0.29))",
   },
   secondary: {
      filter: "drop-shadow(2.302px 32.92px 17.5px rgba(112,57,229,0.19))",
      backgroundImage: `linear-gradient(-8deg, ${theme.palette.secondary.main} 1%, ${theme.palette.secondary.light} 100%)`,
   },
   angled: {
      transform: `translate(-50%,-50%) rotate(${angle}deg)`,
   },
   angledReverse: {
      transform: `translate(-50%,-50%) rotate(-${angle}deg)`,
   },
   rectangle: {
      borderRadius: "25%",
      position: "absolute",
      top: "50%",
      left: "50%",
      width: rectLength,
      height: rectLength,
      [theme.breakpoints.down("sm")]: {
         width: rectLength * 0.7,
         height: rectLength * 0.7,
      },
   },
   graphic: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: `translate(-50%,-50%)`,
   },
}));

const BenefitCard = ({ description, imageUrl, name }) => {
   const classes = useStyles();

   return (
      <div className={classes.root}>
         <div className={classes.graphicContainer}>
            <div
               className={clsx(classes.rectangle, {
                  [classes.angledReverse]: true,
                  [classes.secondary]: true,
               })}
            />
            <div
               className={clsx(classes.rectangle, {
                  [classes.angled]: true,
                  [classes.primary]: true,
               })}
            />
            <img className={classes.graphic} src={imageUrl} alt={name} />
         </div>
         <Typography gutterBottom component="h5" align="center" variant="h5">
            <b>{name}</b>
         </Typography>
         <Typography variant="body1" color="textSecondary" align="center">
            {description}
         </Typography>
      </div>
   );
};

export default BenefitCard;

BenefitCard.propTypes = {
   description: PropTypes.string,
   imageUrl: PropTypes.string,
};

import React from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import clsx from "clsx";
import Slide from "@stahl.luke/react-reveal/Slide";

const useStyles = makeStyles((theme) => {
   const circleWidth = theme.spacing(22);
   return {
      root: {},
      graphicsContainer: {
         position: "relative",
         width: "100%",
         aspectRatio: "1 / 1",
         marginBottom: theme.spacing(2),
      },
      graphicCircle: {
         width: circleWidth,
         height: circleWidth,
         borderRadius: "50%",
         background: `linear-gradient(${alpha(
            theme.palette.secondary.main,
            0.1
         )}, 75%, ${theme.palette.secondary.light})`,
         position: "absolute",
      },
      secondaryShadow: {
         filter: `drop-shadow(4.092px 4.39px 9.5px ${theme.palette.secondary.light})`,
      },
      primaryShadow: {
         filter: `drop-shadow(4.092px 4.39px 9.5px ${alpha(
            theme.palette.primary.light,
            0.2
         )})`,
      },
      bottomLeft: {
         top: "55%",
         left: "45%",
         transform: "translate(-50%, -50%)",
      },
      topRight: {
         top: "45%",
         left: "55%",
         transform: "translate(-50%, -50%)",
      },
      middle: {
         top: "50%",
         left: "50%",
         transform: "translate(-50%, -50%)",
         background: theme.palette.primary.main,
         color: theme.palette.common.white,
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
      },
      amount: {
         fontSize: "3.5rem",
      },
      label: {
         fontWeight: 600,
         fontSize: "2rem",
      },
   };
});
const NumbersCard = ({ label, amount }) => {
   const classes = useStyles();
   return (
      <div className={classes.root}>
         <div className={classes.graphicsContainer}>
            <div
               className={clsx(
                  classes.graphicCircle,
                  classes.bottomLeft,
                  classes.secondaryShadow
               )}
            />
            <div
               className={clsx(
                  classes.graphicCircle,
                  classes.topRight,
                  classes.secondaryShadow
               )}
            />
            <div
               className={clsx(
                  classes.graphicCircle,
                  classes.middle,
                  classes.primaryShadow
               )}
            >
               <Typography
                  className={classes.amount}
                  variant="h4"
                  align="center"
               >
                  {amount}
               </Typography>
            </div>
         </div>
         <Typography align="center" variant="h3" className={classes.label}>
            {label}
         </Typography>
      </div>
   );
};

export default NumbersCard;

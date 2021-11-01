import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ButtonBase, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      minWidth: 250,
      padding: "1rem",
      paddingTop: 0,
      width: "100%",
   },
   image: {
      position: "relative",
      background: theme.palette.common.white,
      padding: theme.spacing(4),
      borderRadius: 6,
      height: 200,
      flex: 1,
      minWidth: 200,
      margin: "0.5rem",
      [theme.breakpoints.down("xs")]: {
         padding: 0,
         width: "100% !important", // Overrides inline-style
         height: 100,
      },
      "&:hover, &$focusVisible": {
         zIndex: 1,
         "& $imageBackdrop": {
            opacity: 0.15,
         },
         "& $imageMarked": {
            opacity: 0,
         },
         "& $imageTitle": {
            border: "4px solid currentColor",
         },
      },
   },

   focusVisible: {
      opacity: 0.3,
   },
   imageSrc: {
      width: "100%",
      height: "100%",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      maxWidth: "80%",
      maxHeight: "80%",
   },
   imageTitle: {
      position: "relative",
      padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${
         theme.spacing(1) + 6
      }px`,
   },
   imageMarked: {
      height: 3,
      width: 18,
      backgroundColor: theme.palette.common.white,
      position: "absolute",
      bottom: -2,
      left: "calc(50% - 9px)",
      transition: theme.transitions.create("opacity"),
   },
}));

const LogoButtons = ({ groups, setGroup }) => {
   const classes = useStyles();

   return (
      <div className={classes.root}>
         {groups.map((group) => (
            <ButtonBase
               focusRipple
               onClick={() => setGroup(group)}
               key={group.universityName}
               className={classes.image}
               focusVisibleClassName={classes.focusVisible}
            >
               <div
                  className={classes.imageSrc}
                  style={{
                     backgroundImage: `url(${group.logoUrl})`,
                  }}
               />
            </ButtonBase>
         ))}
      </div>
   );
};

export default LogoButtons;

import React, { useState } from "react";
import { Button, Collapse, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   groupBioWrapper: {
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      color: theme.palette.common.white,
      marginBottom: "1rem",
   },
   groupBioButton: {
      color: theme.palette.common.white,
   },
   groupBioIconFlipped: {
      transform: "rotate(180deg)",
   },
   groupBioIcon: {
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   groupBioText: {
      color: "inherit",
      whiteSpace: "pre-line",
      padding: theme.spacing(0, 20),
      [theme.breakpoints.down("sm")]: {
         padding: theme.spacing(0),
      },
   },
}));

const GroupBio = ({ groupBio }) => {
   const classes = useStyles();
   const [showMore, setShowMore] = useState(false);
   const handleToggle = () => setShowMore(!showMore);
   return (
      <div className={classes.groupBioWrapper}>
         <Button
            endIcon={
               <ExpandMoreIcon
                  className={clsx(classes.groupBioIcon, {
                     [classes.groupBioIconFlipped]: showMore,
                  })}
               />
            }
            size="large"
            className={classes.groupBioButton}
            onClick={handleToggle}
         >
            {showMore ? "Hide Info" : "More Info"}
         </Button>
         <Collapse in={showMore}>
            <Typography className={classes.groupBioText}>{groupBio}</Typography>
         </Collapse>
      </div>
   );
};

export default GroupBio;

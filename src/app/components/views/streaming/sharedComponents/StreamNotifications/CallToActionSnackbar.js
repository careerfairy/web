import React, { useState, forwardRef, useCallback } from "react";
import clsx from "clsx";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { SnackbarContent } from "notistack";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import {
   CardContent,
   CardMedia,
} from "@material-ui/core";
import { getResizedUrl, prettyLocalizedDate } from "../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      [theme.breakpoints.up("sm")]: {
         minWidth: "344px !important",
      },
   },
   glass: {
      backgroundColor: alpha(theme.palette.common.black, 0.4),
      backdropFilter: "blur(5px)",
      color: theme.palette.common.white,
   },
   mainButton: {
      color: "inherit",
   },
   card: {
      width: "100%",
      borderLeft: `4mm ridge ${alpha(theme.palette.primary.main, 0.6)}`,
   },
   messageWrapper: {
      display: "flex",
      // border: "1px solid pink",
      flex: 1,
   },
   typography: {
      fontWeight: "bold",
   },
   actionRoot: {
      padding: "8px 8px 8px 16px",
      justifyContent: "space-between",
   },
   mainIconWrapper: {
      "& svg": {
         fontSize: 50,
      },
   },
   icons: {
      marginLeft: "auto",
      display: "flex",
   },
   close: {
      color: "inherit",
   },
   expand: {
      padding: "8px 8px",
      transform: "rotate(0deg)",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.shortest,
      }),
   },
   expandOpen: {
      transform: "rotate(180deg)",
   },
   collapse: {
      padding: 16,
      borderRadius: 0,
   },
   checkIcon: {
      fontSize: 20,
      color: "#b3b3b3",
      paddingRight: 4,
   },
   button: {
      padding: 0,
      textTransform: "none",
   },
   imageBackground:{
      backgroundColor: theme.palette.common.white,
      boxShadow: theme.shadows[5],
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: 140,
   },
   image: {
      objectFit: "contain",
      maxWidth: "90%",
      maxHeight: "90%"
   },
   jobCard: {
      borderRadius: 0,
   },
}));

const JobDetailSection = ({ title, body }) => (
   <>
      <Typography gutterBottom variant="h6" component="h2">
         {title}
      </Typography>
      <Typography
         variant="body2"
         color="textSecondary"
         gutterBottom
         component="p"
         style={{
            whiteSpace: "pre-line",
         }}
      >
         {body}
      </Typography>
   </>
);

const CallToActionSnackbar = forwardRef(
   (
      {
         message,
         id,
         onClick,
         onDismiss,
         icon,
         loading,
         buttonText,
         isJobPosting,
         jobTitle,
         salary,
         applicationDeadline,
         snackBarImage,
      },
      ref
   ) => {
      const classes = useStyles();
      const [expanded, setExpanded] = useState(false);
      const handleExpandClick = useCallback(() => {
         setExpanded((oldExpanded) => !oldExpanded);
      }, []);

      return (
         <SnackbarContent ref={ref} className={classes.root}>
            <Card className={clsx(classes.card, classes.glass)}>
               <CardActions classes={{ root: classes.actionRoot }}>
                  <span className={classes.mainIconWrapper}>
                     {icon && icon}
                  </span>
                  <div className={classes.messageWrapper}>
                     <Typography
                        variant="subtitle2"
                        className={classes.typography}
                     >
                        {isJobPosting ? jobTitle : message}
                     </Typography>
                  </div>
                  <div className={classes.icons}>
                     {isJobPosting && message ? (
                        <Button
                           className={classes.close}
                           disabled={loading}
                           startIcon={
                              expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                           }
                           onClick={handleExpandClick}
                        >
                           {expanded ? "Less info" : "More info"}
                        </Button>
                     ) : (
                        <Button
                           className={classes.mainButton}
                           onClick={onClick}
                           disabled={loading}
                           size="small"
                        >
                           {loading ? "" : buttonText}
                        </Button>
                     )}
                     <IconButton
                        className={classes.close}
                        disabled={loading}
                        onClick={onDismiss}
                     >
                        <CloseIcon />
                     </IconButton>
                  </div>
               </CardActions>
               <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Card className={classes.jobCard}>
                     {snackBarImage && (
                        <CardMedia
                          className={classes.imageBackground}
                        >
                           <img
                             className={classes.image}
                           src={getResizedUrl(snackBarImage, "sm")}
                           alt="company logo"
                           />
                        </CardMedia>
                     )}
                     <CardContent>
                        {jobTitle &&
                           <JobDetailSection
                              title="Job Title"
                              body={jobTitle}
                           />
                        }
                        <JobDetailSection
                           title="Job Description"
                           body={message}
                        />
                        {salary &&
                           <JobDetailSection
                              title="Salary"
                              body={salary}
                           />
                        }
                        {applicationDeadline &&
                           <JobDetailSection
                              title="Application Deadline"
                              body={prettyLocalizedDate(applicationDeadline)}
                           />
                        }
                     </CardContent>
                     <CardActions>
                        <Button
                           className={classes.mainButton}
                           onClick={onClick}
                           disabled={loading}
                           size="small"
                           variant="contained"
                           color="primary"
                        >
                           {loading ? "" : buttonText}
                        </Button>
                     </CardActions>
                  </Card>
               </Collapse>
            </Card>
         </SnackbarContent>
      );
   }
);

export default CallToActionSnackbar;

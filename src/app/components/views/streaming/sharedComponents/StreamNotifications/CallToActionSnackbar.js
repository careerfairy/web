import React, { useState, forwardRef, useCallback, useContext } from "react";
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
import { CardContent, CardMedia } from "@material-ui/core";
import {
   getResizedUrl,
   prettyLocalizedDate,
} from "../../../../helperFunctions/HelperFunctions";
import { StyledTooltipWithButton } from "../../../../../materialUI/GlobalTooltips";
import { useFirebase } from "../../../../../context/firebase";
import TutorialContext from "../../../../../context/tutorials/TutorialContext";

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
      color: theme.palette.common.white,
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
   imageBackground: {
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
      maxHeight: "90%",
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
         isForTutorial,
         hideClose,
      },
      ref
   ) => {
      const { handleConfirmStep, isOpen } = useContext(TutorialContext);
      const classes = useStyles();
      const [expanded, setExpanded] = useState(false);

      const [tutorialState, setTutorialState] = useState(
         isForTutorial ? "expand" : ""
      );

      const handleExpandClick = useCallback(() => {
         if (tutorialState === "expand") {
            handleSetTutorialStateToApply();
         }
         setExpanded((oldExpanded) => !oldExpanded);
      }, [tutorialState]);

      const handleClearSnackTutorialState = () => {
         if (isForTutorial) {
            handleConfirmStep(21)
         }
         setTutorialState("");
      };

      const handleSetTutorialStateToApply = () => {
         setTutorialState("apply");
      };

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
                        <StyledTooltipWithButton
                           open={tutorialState === "expand"}
                           tooltipTitle="Share Job Posts (6/8)"
                           placement="right"
                           buttonText="See job posting details"
                           onConfirm={() => {
                              handleExpandClick();
                           }}
                           tooltipText="Click here to see the details of this particular job posting."
                        >
                           <Button
                              className={classes.close}
                              disabled={loading}
                              startIcon={
                                 expanded ? (
                                    <ExpandLessIcon />
                                 ) : (
                                    <ExpandMoreIcon />
                                 )
                              }
                              onClick={handleExpandClick}
                           >
                              {expanded ? "Less info" : "More info"}
                           </Button>
                        </StyledTooltipWithButton>
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
                     {!hideClose && (
                        <IconButton
                           className={classes.close}
                           disabled={loading}
                           onClick={() => {
                              handleClearSnackTutorialState();
                              onDismiss();
                           }}
                        >
                           <CloseIcon />
                        </IconButton>
                     )}
                  </div>
               </CardActions>
               <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Card className={classes.jobCard}>
                     {snackBarImage && (
                        <CardMedia className={classes.imageBackground}>
                           <img
                              className={classes.image}
                              src={snackBarImage}
                              alt="company logo"
                           />
                        </CardMedia>
                     )}
                     <CardContent>
                        {jobTitle && (
                           <JobDetailSection
                              title="Job Title"
                              body={jobTitle}
                           />
                        )}
                        <JobDetailSection
                           title="Job Description"
                           body={message}
                        />
                        {salary && (
                           <JobDetailSection title="Salary" body={salary} />
                        )}
                        {applicationDeadline && (
                           <JobDetailSection
                              title="Application Deadline"
                              body={prettyLocalizedDate(applicationDeadline)}
                           />
                        )}
                     </CardContent>
                     <CardActions>
                        <StyledTooltipWithButton
                           open={tutorialState === "apply"}
                           tooltipTitle="Share Job Posts (7/8)"
                           placement="right"
                           buttonText="Checkout"
                           onConfirm={() => {
                              handleClearSnackTutorialState();
                              onClick();
                           }}
                           tooltipText="Clicking apply will take your audience to the page of the job posting."
                        >
                           <Button
                              className={classes.mainButton}
                              onClick={() => {
                                 onClick()
                                 handleClearSnackTutorialState()
                              }}
                              disabled={loading}
                              size="small"
                              variant="contained"
                              color="primary"
                           >
                              {loading ? "" : buttonText}
                           </Button>
                        </StyledTooltipWithButton>
                     </CardActions>
                  </Card>
               </Collapse>
            </Card>
         </SnackbarContent>
      );
   }
);

export default CallToActionSnackbar;

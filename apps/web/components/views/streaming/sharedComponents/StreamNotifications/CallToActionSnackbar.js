import React, { useState, forwardRef, useCallback, useContext } from "react"
import clsx from "clsx"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { SnackbarContent } from "notistack"
import Collapse from "@mui/material/Collapse"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import CircularProgress from "@mui/material/CircularProgress"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import {
   CardContent,
   CardMedia,
   Dialog,
   DialogActions,
   DialogTitle,
   DialogContent,
   DialogContentText,
} from "@mui/material"
import { prettyLocalizedDate } from "../../../../helperFunctions/HelperFunctions"
import { StyledTooltipWithButton } from "../../../../../materialUI/GlobalTooltips"
import TutorialContext from "../../../../../context/tutorials/TutorialContext"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useAuth } from "HOCs/AuthProvider"

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
}))

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
)

const CallToActionSnackbar = forwardRef(
   (
      {
         message,
         onClick,
         onDismiss,
         icon,
         loading,
         buttonText,
         isJobPosting,
         jobTitle,
         buttonUrl,
         salary,
         applicationDeadline,
         snackBarImage,
         isForTutorial,
         hideClose,
      },
      ref
   ) => {
      const { handleConfirmStep, isOpen } = useContext(TutorialContext)
      const { authenticatedUser, userData } = useAuth()

      const classes = useStyles()
      const firebase = useFirebaseService()
      const [expanded, setExpanded] = useState(false)

      const [isSendingEmail, setIsSendingEmail] = useState(false)
      const [showEmailMessage, setShowEmailMessage] = useState(false)

      const [tutorialState, setTutorialState] = useState(
         isForTutorial ? "expand" : ""
      )

      const handleExpandClick = useCallback(() => {
         if (tutorialState === "expand") {
            handleSetTutorialStateToApply()
         }
         setExpanded((oldExpanded) => !oldExpanded)
      }, [tutorialState])

      const handleClearSnackTutorialState = () => {
         if (isForTutorial) {
            handleConfirmStep(21)
         }
         setTutorialState("")
      }

      const handleSetTutorialStateToApply = () => {
         setTutorialState("apply")
      }

      const sendEmailReminderForApplication = async () => {
         setIsSendingEmail(true)
         try {
            await firebase.sendReminderEmailAboutApplicationLink({
               recipient: authenticatedUser.email,
               recipient_name: userData.firstName,
               position_name: jobTitle,
               application_link: buttonUrl,
            })
            setIsSendingEmail(false)
            setShowEmailMessage(true)
         } catch (error) {
            console.log(error)
            setIsSendingEmail(false)
         }
      }

      const handleCloseDialog = () => {
         setShowEmailMessage(false)
      }

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
                              handleExpandClick()
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
                              handleClearSnackTutorialState()
                              onDismiss()
                           }}
                           size="large"
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
                              handleClearSnackTutorialState()
                              onClick()
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
                        {isJobPosting && authenticatedUser && (
                           <Button
                              className={classes.mainButton}
                              onClick={sendEmailReminderForApplication}
                              disabled={isSendingEmail}
                              size="small"
                              variant="contained"
                              color="secondary"
                              startIcon={
                                 isSendingEmail && (
                                    <CircularProgress size={15} />
                                 )
                              }
                           >
                              Send Email Reminder
                           </Button>
                        )}
                        <Dialog
                           open={showEmailMessage}
                           onClose={handleCloseDialog}
                        >
                           <DialogTitle>Check your inbox!</DialogTitle>
                           <DialogContent>
                              <DialogContentText>
                                 We just sent you an email so that you can
                                 comfortably complete your application after
                                 this live stream.
                              </DialogContentText>
                           </DialogContent>
                           <DialogActions>
                              <Button
                                 color="primary"
                                 autoFocus
                                 onClick={handleCloseDialog}
                              >
                                 Close
                              </Button>
                           </DialogActions>
                        </Dialog>
                     </CardActions>
                  </Card>
               </Collapse>
            </Card>
         </SnackbarContent>
      )
   }
)

CallToActionSnackbar.displayName = "CallToActionSnackbar"

export default CallToActionSnackbar

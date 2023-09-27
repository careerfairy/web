import React, { useEffect, useMemo, useRef, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import {
   AppBar,
   Button,
   CardActions,
   CircularProgress,
   Dialog,
   DialogContent,
   Slide,
   Toolbar,
   Typography,
} from "@mui/material"
import DraftStreamForm from "../../../draftStreamForm/DraftStreamForm"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import {
   buildLivestreamObject,
   buildPromotionObj,
} from "../../../../helperFunctions/streamFormFunctions"
import {
   GENERAL_ERROR,
   SAVE_WITH_NO_VALIDATION,
   SUBMIT_FOR_APPROVAL,
} from "../../../../util/constants"
import SaveIcon from "@mui/icons-material/Save"
import { useSnackbar } from "notistack"
import PublishIcon from "@mui/icons-material/Publish"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { useStreamCreationProvider } from "../../../draftStreamForm/StreamForm/StreamCreationProvider"
import useIsMobile from "../../../../custom-hook/useIsMobile"

const useStyles = makeStyles((theme) => ({
   title: {
      marginLeft: theme.spacing(2),
      flex: 1,
      color: theme.palette.text.primary,
   },
   background: {
      background: "white",
      [theme.breakpoints.down("md")]: {
         margin: theme.spacing(2),
      },
   },
   appBar: {
      backgroundColor: "white",
      boxShadow: "none",
      borderBottom: `1px solid ${theme.palette.divider}`,
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px",
   },
   content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   contentRoot: {
      [theme.breakpoints.down("md")]: {
         padding: 0,
      },
   },
   whiteBtn: {
      color: theme.palette.primary.main,
      background: "white",
      margin: theme.spacing(1),
      "&:hover": {
         color: "white",
         background: theme.palette.primary.main,
      },
   },
}))

const Transition = React.forwardRef(function Transition(props, ref) {
   return <Slide direction="up" ref={ref} {...props} />
})

const NewStreamModal = ({
   group,
   open,
   onClose,
   typeOfStream,
   currentStream,
   handleResetCurrentStream,
   handlePublishStream,
}) => {
   const firebase = useFirebaseService()
   const formRef = useRef()
   const submitButtonRef = useRef()
   const dialogRef = useRef()
   const saveChangesButtonRef = useRef()
   const { authenticatedUser } = useAuth()
   const { enqueueSnackbar } = useSnackbar()
   const [submitted, setSubmitted] = useState(false)
   const [publishDraft, setPublishDraft] = useState(false)
   const classes = useStyles()
   const { formHasChanged } = useStreamCreationProvider()
   const isMobile = useIsMobile()

   const isDraftsPage = useMemo(() => typeOfStream === "draft", [typeOfStream])
   const isUpcomingPage = useMemo(
      () => typeOfStream === "upcoming",
      [typeOfStream]
   )
   const isPastPage = useMemo(() => typeOfStream === "past", [typeOfStream])

   const isUpcomingOrPastStreamsPage = useMemo(
      () => isPastPage || isUpcomingPage,
      [isPastPage, isUpcomingPage]
   )

   const isDraft = useMemo(
      () => Boolean((currentStream && isDraftsPage) || !currentStream),
      [currentStream, isDraftsPage]
   )

   const isActualLivestream = useMemo(
      () => Boolean(currentStream && isUpcomingOrPastStreamsPage),
      [currentStream, isUpcomingOrPastStreamsPage]
   )

   const canPublish = useMemo(
      () => Boolean(isDraft && currentStream),
      [currentStream, isDraft]
   )

   useEffect(() => {
      const closeAlert = (e) => {
         e.preventDefault()
         e.returnValue = ""
      }

      // add close alert only if it is on the dialog and the form has changed
      if (open && formHasChanged) {
         window.addEventListener("beforeunload", closeAlert)
      } else {
         window.removeEventListener("beforeunload", closeAlert)
      }

      return () => {
         window.removeEventListener("beforeunload", closeAlert)
      }
   }, [open, formHasChanged])

   const handleCloseDialog = () => {
      handleResetCurrentStream()
      setSubmitted(false)
      onClose()
   }

   const handlePublishDraft = async (streamToPublish, promotion) => {
      if (canPublish) {
         try {
            formRef.current?.setSubmitting(true)
            const newStream = { ...streamToPublish }
            newStream.companyId = uuidv4()
            await handlePublishStream(newStream, promotion)
         } catch (e) {
            console.log("-> e", e)
            enqueueSnackbar(GENERAL_ERROR, {
               variant: "error",
               preventDuplicate: true,
            })
         } finally {
            formRef.current?.setSubmitting(false)
         }
      } else {
         enqueueSnackbar("You cannot publish a stream!", {
            variant: "error",
            preventDuplicate: true,
         })
      }

      handleCloseDialog()
   }

   const handleValidate = () => {
      setPublishDraft(true)
      handleSubmit()
   }

   const onSubmit = async (
      values,
      { setSubmitting },
      updateMode,
      draftStreamId,
      setFormData,
      setDraftId,
      status,
      setStatus,
      selectedJobs,
      metaData
   ) => {
      let livestream

      try {
         setSubmitting(true)
         livestream = buildLivestreamObject(
            values,
            updateMode,
            draftStreamId,
            firebase
         )
         if (status === SAVE_WITH_NO_VALIDATION) {
            const newStatus = {}
            livestream.status = newStatus
            setFormData((prevState) => ({ ...prevState, status: newStatus }))
         }
         if (status === SUBMIT_FOR_APPROVAL) {
            livestream.status = {
               pendingApproval: true,
               seen: false,
            }
         }

         if (selectedJobs) {
            livestream.jobs = selectedJobs
         }

         livestream.hasJobs =
            selectedJobs?.length > 0 || livestream?.customJobs.length > 0

         if (metaData) {
            livestream.companySizes = metaData.companySizes
            livestream.companyIndustries = metaData.companyIndustries
            livestream.companyCountries = metaData.companyCountries
         }

         // only save the promotions if the start date is after 30 days from now
         const promotion = buildPromotionObj(values, livestream.id)

         if (publishDraft) {
            await handlePublishDraft(livestream, promotion)
            setPublishDraft(false)
            return
         }
         let id
         const targetCollection = isActualLivestream
            ? "livestreams"
            : "draftLivestreams"

         if (updateMode) {
            id = livestream.id
            if (!livestream.lastUpdatedAuthorInfo) {
               livestream.lastUpdatedAuthorInfo = {
                  groupId: group.id,
                  email: authenticatedUser.email,
               }
            }
            await firebase.updateLivestream(
               livestream,
               targetCollection,
               promotion
            )
         } else {
            const author = {
               groupId: group.id,
               email: authenticatedUser.email,
            }
            id = await firebase.addLivestream(
               livestream,
               targetCollection,
               author,
               promotion
            )
         }
         handleCloseDialog()

         setDraftId(id)
         if (status === SAVE_WITH_NO_VALIDATION) {
            enqueueSnackbar("You changes have been saved!", {
               variant: "success",
               preventDuplicate: true,
            })
            setStatus("")
         }
      } catch (e) {
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
         console.log("-> e", e)
      } finally {
         setSubmitting(false)

         if (livestream && status === SUBMIT_FOR_APPROVAL) {
            // only update the form at the end to not force a rerender
            // and because of it the isSubmitting flag will be false until the end of this logic
            setFormData((prevState) => ({
               ...prevState,
               status: livestream.status,
            }))
         }
      }
   }

   const handleSubmit = () => {
      submitButtonRef?.current?.click()
   }

   const handleSaveOrUpdate = () => {
      setPublishDraft(false)
      if (isDraft) {
         saveChangesButtonRef?.current?.click()
      } else {
         handleSubmit()
      }
   }

   const Actions = () => (
      <>
         <Button
            disabled={formRef.current?.isSubmitting}
            size={isMobile ? "small" : "large"}
            variant="outlined"
            color="secondary"
            onClick={handleCloseDialog}
            sx={{ marginRight: isMobile ? "unset" : 2 }}
         >
            <Typography variant="inherit">Back to events page</Typography>
         </Button>
         {canPublish && (
            <Button
               startIcon={<PublishIcon fontSize="large" />}
               disabled={formRef.current?.isSubmitting}
               variant="contained"
               size={isMobile ? "small" : "large"}
               color="secondary"
               onClick={handleValidate}
               sx={{ marginRight: isMobile ? "unset" : 2 }}
               endIcon={
                  formRef.current?.isSubmitting && (
                     <CircularProgress size={20} color="inherit" />
                  )
               }
            >
               <Typography variant="inherit">publish as stream</Typography>
            </Button>
         )}
         <Button
            disabled={formRef.current?.isSubmitting}
            size={isMobile ? "small" : "large"}
            startIcon={currentStream && <SaveIcon fontSize="large" />}
            variant="contained"
            color="secondary"
            onClick={handleSaveOrUpdate}
            endIcon={
               formRef.current?.isSubmitting && (
                  <CircularProgress size={20} color="inherit" />
               )
            }
         >
            <Typography variant="inherit">
               {!currentStream
                  ? "Create draft"
                  : isActualLivestream
                  ? "update and close"
                  : "save changes and close"}
            </Typography>
         </Button>
      </>
   )

   return (
      <Dialog
         keepMounted={false}
         TransitionComponent={Transition}
         scroll="paper"
         onClose={handleCloseDialog}
         open={open}
         maxWidth="xl"
         PaperProps={{
            className: classes.background,
         }}
      >
         <AppBar className={classes.appBar} position="sticky">
            <Toolbar
               sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "unset",
               }}
            >
               <Typography variant="h4" className={classes.title}>
                  {isActualLivestream
                     ? "Update Stream"
                     : currentStream
                     ? "Update draft"
                     : "New draft"}
               </Typography>
               <CardActions>
                  <Actions />
               </CardActions>
            </Toolbar>
         </AppBar>
         <DialogContent className={classes.contentRoot}>
            {/*Have to nest DialogContent Elements in order for scroll to top in Dialogs to work (weird MUI bug: github.com/mui-org/material-ui/issues/9186)*/}
            <div ref={dialogRef}>
               <DialogContent
                  className={`${classes.content} ${classes.contentRoot}`}
               >
                  <DraftStreamForm
                     formRef={formRef}
                     group={group}
                     saveChangesButtonRef={saveChangesButtonRef}
                     onSubmit={onSubmit}
                     submitted={submitted}
                     isActualLivestream={isActualLivestream}
                     currentStream={currentStream}
                     setSubmitted={setSubmitted}
                     canPublish={canPublish}
                     isOnDialog={true}
                     submitButtonRef={submitButtonRef}
                     isDraft={isDraft}
                  />
               </DialogContent>
            </div>
         </DialogContent>
      </Dialog>
   )
}

export default NewStreamModal

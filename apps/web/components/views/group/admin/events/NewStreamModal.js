import React, { useCallback, useMemo, useRef, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import {
   AppBar,
   Button,
   CardActions,
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
import {
   StreamCreationProvider,
   useStreamCreationProvider,
} from "../../../draftStreamForm/StreamForm/StreamCreationProvider"

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
   const dialogRef = useRef()
   const saveChangesButtonRef = useRef()
   const { authenticatedUser } = useAuth()
   const { enqueueSnackbar } = useSnackbar()
   const [submitted, setSubmitted] = useState(false)
   const [publishDraft, setPublishDraft] = useState(false)
   const classes = useStyles()
   const { showPromotionInputs } = useStreamCreationProvider()

   const isDraftsPage = useMemo(() => typeOfStream === "draft", [typeOfStream])
   const isUpcomingPage = () => typeOfStream === "upcoming"
   const isPastPage = () => typeOfStream === "past"

   const isUpcomingOrPastStreamsPage = () => isPastPage() || isUpcomingPage()

   const isDraft = useMemo(
      () => Boolean((currentStream && isDraftsPage) || !currentStream),
      [currentStream, isDraftsPage]
   )

   const isActualLivestream = () =>
      Boolean(currentStream && isUpcomingOrPastStreamsPage())

   const canPublish = useMemo(
      () => Boolean(isDraft && currentStream),
      [currentStream, isDraft]
   )

   const handleCloseDialog = () => {
      handleResetCurrentStream()
      setSubmitted(false)
      onClose()
   }

   const handlePublishDraft = async (streamToPublish) => {
      if (canPublish) {
         try {
            formRef.current?.setSubmitting(true)
            const newStream = { ...streamToPublish }
            newStream.companyId = uuidv4()
            await handlePublishStream(newStream)
            handleCloseDialog()
         } catch (e) {
            console.log("-> e", e)
            enqueueSnackbar(GENERAL_ERROR, {
               variant: "error",
               preventDuplicate: true,
            })
         }
         formRef.current?.setSubmitting(false)
      } else {
         enqueueSnackbar("You cannot publish a stream!", {
            variant: "error",
            preventDuplicate: true,
         })
      }
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
      selectedJobs
   ) => {
      try {
         setSubmitting(true)
         const livestream = buildLivestreamObject(
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
            const newStatus = {
               pendingApproval: true,
               seen: false,
            }
            livestream.status = newStatus
            setFormData((prevState) => ({ ...prevState, status: newStatus }))
         }

         if (selectedJobs) {
            livestream.jobs = selectedJobs
         }

         if (publishDraft) {
            await handlePublishDraft(livestream)
            setPublishDraft(false)
            return
         }
         let id
         const targetCollection = isActualLivestream()
            ? "livestreams"
            : "draftLivestreams"

         // only save the promotions if the start date is after 30 days from now
         const promotion = showPromotionInputs
            ? buildPromotionObj(values, livestream.id)
            : buildPromotionObj({}, livestream.id)

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
      }
      setSubmitting(false)
   }

   const handleSubmit = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
      if (formRef.current) {
         formRef.current.handleSubmit()
      }
      if (dialogRef.current) {
         dialogRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
         })
      }
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
            size="large"
            variant="outlined"
            color="secondary"
            onClick={handleCloseDialog}
            sx={{ marginRight: 2 }}
         >
            <Typography variant="h7">Back to events page</Typography>
         </Button>
         {canPublish && (
            <Button
               startIcon={<PublishIcon fontSize="large" />}
               disabled={formRef.current?.isSubmitting}
               variant="contained"
               size="large"
               autoFocus
               color="secondary"
               onClick={handleValidate}
               sx={{ marginRight: 2 }}
            >
               <Typography variant="h7">publish as stream</Typography>
            </Button>
         )}
         <Button
            disabled={formRef.current?.isSubmitting}
            size="large"
            startIcon={currentStream && <SaveIcon fontSize="large" />}
            variant="contained"
            autoFocus
            color="secondary"
            onClick={handleSaveOrUpdate}
         >
            <Typography variant="h7">
               {!currentStream
                  ? "Create draft"
                  : isActualLivestream()
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
            <Toolbar>
               <Typography variant="h4" className={classes.title}>
                  {isActualLivestream()
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
                  <StreamCreationProvider>
                     <DraftStreamForm
                        formRef={formRef}
                        group={group}
                        saveChangesButtonRef={saveChangesButtonRef}
                        onSubmit={onSubmit}
                        submitted={submitted}
                        isActualLivestream={isActualLivestream()}
                        currentStream={currentStream}
                        setSubmitted={setSubmitted}
                        canPublish={canPublish}
                        isOnDialog={true}
                     />
                  </StreamCreationProvider>
               </DialogContent>
            </div>
         </DialogContent>
      </Dialog>
   )
}

export default NewStreamModal

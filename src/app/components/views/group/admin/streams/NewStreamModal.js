import React, {Fragment, useRef, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {AppBar, CardActions, Dialog, Slide} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DraftStreamForm from "../../../draftStreamForm/DraftStreamForm";
import {withFirebase} from "../../../../../context/firebase";
import {buildLivestreamObject} from "../../../../helperFunctions/streamFormFunctions";
import {GENERAL_ERROR, SAVE_WITH_NO_VALIDATION, SUBMIT_FOR_APPROVAL} from "../../../../util/constants";
import {useSnackbar} from "notistack";
import {useRouter} from "next/router";
import {v4 as uuidv4} from "uuid";

const useStyles = makeStyles(theme => ({

    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    background: {
        backgroundColor: theme.palette.primary.dark,
    },
    appBar: {
        backgroundColor: theme.palette.navyBlue.main,
        marginBottom: theme.spacing(2)
    }
}));


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const NewStreamModal = ({group, open, onClose, firebase, typeOfStream, currentStream, handleResetCurrentStream,}) => {
    const formRef = useRef()
    const saveChangesButtonRef = useRef()
    const router = useRouter()
    const {enqueueSnackbar} = useSnackbar()
    const [submitted, setSubmitted] = useState(false)
    const classes = useStyles()

    const {push} = router;

    const isDraftsPage = () => typeOfStream === "draft"
    const isUpcomingPage = () => typeOfStream === "upcoming"
    const isPastPage = () => typeOfStream === "past"

    const isUpcomingOrPastStreamsPage = () => isPastPage() || isUpcomingPage()

    const isDraft = () => Boolean(currentStream && isDraftsPage() || !currentStream)

    const isActualLivestream = () => Boolean(currentStream && isUpcomingOrPastStreamsPage())

    const canPublish = () => Boolean(isDraft() && currentStream)

    const handleCloseDialog = () => {
        handleResetCurrentStream()
        setSubmitted(false)
        onClose()
    }

    const handlePublishDraft = async () => {
        if (canPublish()) {
            try {
                formRef.current?.setSubmitting(true)
                const newStream = {...currentStream}
                newStream.companyId = uuidv4()
                await firebase.addLivestream(newStream, "livestreams")
                await firebase.deleteLivestream(currentStream.id, "draftLivestreams")

                push(`/group/${group.id}/admin/upcoming-livestreams`)
                handleCloseDialog()
            } catch (e) {
                console.log("-> e", e);
                enqueueSnackbar(GENERAL_ERROR, {
                    variant: "error",
                    preventDuplicate: true,
                });
            }
            formRef.current?.setSubmitting(false)
        } else {
            enqueueSnackbar("You cannot publish a stream!", {
                variant: "error",
                preventDuplicate: true,
            });
        }
    }


    const onSubmit = async (values, {setSubmitting}, targetCategories, updateMode, draftStreamId, setFormData, setDraftId, status, setStatus) => {
        try {
            setSubmitting(true)
            console.log("-> in the submit");
            const livestream = buildLivestreamObject(values, targetCategories, updateMode, draftStreamId, firebase);
            if (status === SUBMIT_FOR_APPROVAL) {
                const newStatus = {
                    pendingApproval: true,
                    seen: false,
                }
                livestream.status = newStatus
                setFormData(prevState => ({...prevState, status: newStatus}))
            }
            let id;
            const targetCollection = isActualLivestream() ? "livestreams" : "draftLivestreams"
            if (updateMode) {
                id = livestream.id
                await firebase.updateLivestream(livestream, targetCollection)
                console.log(`-> ${!isActualLivestream() && "Draft "}livestream was updated with id`, id);
            } else {
                id = await firebase.addLivestream(livestream, targetCollection)
                console.log(`-> ${!isActualLivestream() && "Draft "}livestream was created with id`, id);
            }
            handleCloseDialog()

            setDraftId(id)
            setSubmitted(true)
            if (status === SAVE_WITH_NO_VALIDATION) {
                enqueueSnackbar("You changes have been saved!", {
                    variant: "default",
                    preventDuplicate: true,
                });
                setStatus("")
            }
        } catch (e) {
            enqueueSnackbar(GENERAL_ERROR, {
                variant: "error",
                preventDuplicate: true,
            });
            console.log("-> e", e);
        }
        setSubmitting(false)
    }

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit()
        }
    }

    const handleSaveOrUpdate = () => {
        if (isDraft()) {
            saveChangesButtonRef?.current?.click()
        }
    }


    return (
        <Dialog
            keepMounted={false}
            TransitionComponent={Transition}
            onClose={handleCloseDialog}
            fullScreen
            open={open}
            PaperProps={{
                className: classes.background
            }}
        >
            <AppBar className={classes.appBar} position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleCloseDialog} aria-label="close">
                        <CloseIcon/>
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {isActualLivestream() ? "Update Stream" : currentStream ? "Update Draft" : "New draft"}
                    </Typography>
                    <CardActions>
                        {canPublish() &&
                        <Button disabled={formRef.current?.isSubmitting} variant="contained" autoFocus color="secondary"
                                onClick={handlePublishDraft}>
                            publish draft
                        </Button>}
                        <Button disabled={formRef.current?.isSubmitting} variant="contained" autoFocus color="primary"
                                onClick={handleSaveOrUpdate}>
                            {!currentStream ? "Create" : isActualLivestream() ? "update" : "save changes"}
                        </Button>
                    </CardActions>
                </Toolbar>
            </AppBar>
            <DraftStreamForm
                formRef={formRef}
                group={group}
                saveChangesButtonRef={saveChangesButtonRef}
                onSubmit={onSubmit}
                submitted={submitted}
                setSubmitted={setSubmitted}
            />
        </Dialog>
    );
};

export default withFirebase(NewStreamModal);

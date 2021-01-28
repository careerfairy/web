import React, {useRef, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {AppBar, CardActions, Dialog, DialogContent, fade, Slide, Zoom} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import DraftStreamForm from "../../../draftStreamForm/DraftStreamForm";
import {withFirebase} from "../../../../../context/firebase";
import {buildLivestreamObject} from "../../../../helperFunctions/streamFormFunctions";
import {GENERAL_ERROR, SAVE_WITH_NO_VALIDATION, SUBMIT_FOR_APPROVAL} from "../../../../util/constants";
import SaveIcon from '@material-ui/icons/Save';
import {useSnackbar} from "notistack";
import AddIcon from '@material-ui/icons/Add';
import PublishIcon from '@material-ui/icons/Publish';
import {useRouter} from "next/router";
import {v4 as uuidv4} from "uuid";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const useStyles = makeStyles(theme => ({

    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    background: {
        backgroundColor: fade(theme.palette.primary.dark, 0.7),
    },
    appBar: {
        backgroundColor: theme.palette.navyBlue.main,
    },
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    whiteBtn: {
        color: theme.palette.primary.main,
        background: "white",
        margin: theme.spacing(1),
        "&:hover": {
            color: 'white',
            background: theme.palette.primary.main,
        }
    },
}));


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const NewStreamModal = ({group, open, onClose, firebase, typeOfStream, currentStream, handleResetCurrentStream}) => {
    const formRef = useRef()
    const dialogRef = useRef()
    const saveChangesButtonRef = useRef()
    const router = useRouter()
    const {enqueueSnackbar} = useSnackbar()
    const [submitted, setSubmitted] = useState(false)
    const [publishDraft, setPublishDraft] = useState(false);
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

    const handleValidate = () => {
        setPublishDraft(true)
        handleSubmit()
    }


    const onSubmit = async (values, {setSubmitting}, targetCategories, updateMode, draftStreamId, setFormData, setDraftId, status, setStatus) => {
        try {
            setSubmitting(true)
            const livestream = buildLivestreamObject(values, targetCategories, updateMode, draftStreamId, firebase);
            if (status === SAVE_WITH_NO_VALIDATION) {
                const newStatus = {}
                livestream.status = newStatus
                setFormData(prevState => ({...prevState, status: newStatus}))
            }
            if (status === SUBMIT_FOR_APPROVAL) {
                const newStatus = {
                    pendingApproval: true,
                    seen: false,
                }
                livestream.status = newStatus
                setFormData(prevState => ({...prevState, status: newStatus}))
            }

            if (publishDraft) {
                await handlePublishDraft()
                setPublishDraft(false)
                return
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
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
        if (formRef.current) {
            formRef.current.handleSubmit()
        }
        if (dialogRef.current) {
            dialogRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
    }

    const handleSaveOrUpdate = () => {
        setPublishDraft(false)
        if (isDraft()) {
            saveChangesButtonRef?.current?.click()
        } else {
            handleSubmit()
        }
    }

    const Actions = ({size, className}) => (
        <>
            {canPublish() &&
            <Button startIcon={<PublishIcon fontSize={size}/>} disabled={formRef.current?.isSubmitting} variant="contained"
                    size={size}
                    className={className}
                    autoFocus color="secondary"
                    onClick={handleValidate}>
                <Typography variant={size === "large" && "h5"}>
                publish as stream
                </Typography>
            </Button>}
            <Button disabled={formRef.current?.isSubmitting}
                    size={size}
                    className={className}
                    startIcon={currentStream && <SaveIcon fontSize={size}/>} variant="contained" autoFocus
                    color="primary"
                    onClick={handleSaveOrUpdate}>
                <Typography variant={size === "large" && "h5"}>
                {!currentStream ? "Create draft" : isActualLivestream() ? "update and close" : "save changes and close"}
                </Typography>
            </Button>
        </>
    )

    return (
        <Dialog
            keepMounted={false}
            TransitionComponent={Transition}
            scroll="body"
            onClose={handleCloseDialog}
            fullScreen
            open={open}
            PaperProps={{
                className: classes.background,
            }}
        >
            <AppBar className={classes.appBar} position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleCloseDialog} aria-label="close">
                        <CloseIcon/>
                    </IconButton>
                    <Typography variant="h4" className={classes.title}>
                        {isActualLivestream() ? "Update Stream" : currentStream ? "Update Draft" : "New draft"}
                    </Typography>
                    <CardActions>
                        <Actions/>
                    </CardActions>
                </Toolbar>
            </AppBar>
            <DialogContent>
                {/*Have to nest DialogContent Elements in order for scroll to top in Dialogs to work (weird MUI bug: github.com/mui-org/material-ui/issues/9186)*/}
                <div ref={dialogRef}>
                    <DialogContent className={classes.content}>
                        <DraftStreamForm
                            formRef={formRef}
                            group={group}
                            saveChangesButtonRef={saveChangesButtonRef}
                            onSubmit={onSubmit}
                            submitted={submitted}
                            isActualLivestream={isActualLivestream()}
                            currentStream={currentStream}
                            setSubmitted={setSubmitted}
                        />
                        <Zoom
                            in
                            timeout={1500}
                            style={{
                                transitionDelay: "500ms",
                            }}
                        >
                            <ButtonGroup>
                                <Actions className={classes.whiteBtn} size="large"/>
                            </ButtonGroup>
                        </Zoom>
                    </DialogContent>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default withFirebase(NewStreamModal);

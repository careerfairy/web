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
import {GENERAL_ERROR, SAVING_CHANGES, SUBMIT_FOR_APPROVAL} from "../../../../util/constants";
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

const NewStreamModal = ({group, open, onClose, firebase, typeOfStream, currentStream, handleResetCurrentStream}) => {
    const formRef = useRef()
    console.log("-> formRef", formRef);
    const router = useRouter()
    const {enqueueSnackbar} = useSnackbar()
    const [submitted, setSubmitted] = useState(false)
    const [status, setStatus] = useState("");
    const [publishingDraft, setPublishingDraft] = useState(false);
    const classes = useStyles()

    const {
        query: {absolutePath},
        push
    } = router;

    const handleSaveChanges = () => {

    }

    const isDraft = () => typeOfStream === "draft"

    const handlePublishDraft = async (livestream) => {
        try {
            setPublishingDraft(true)
            const newStream = {...livestream}
            newStream.companyId = uuidv4()
            await firebase.addLivestream(newStream, "livestreams")
            await firebase.deleteLivestream(livestream.id, "draftLivestreams")
            push(`/group/${group.id}/admin/upcoming-livestreams`)
            setPublishingDraft(false)
        } catch (e) {
            setPublishingDraft(false)
            enqueueSnackbar(GENERAL_ERROR, {
                variant: "error",
                preventDuplicate: true,
            });
        }
    }


    const onSubmit = async (values, {setSubmitting}, targetCategories, updateMode, draftStreamId, setFormData, setDraftId, status) => {
        try {
            setSubmitting(true)
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
            if (updateMode) {
                id = livestream.id
                await firebase.updateLivestream(livestream, "draftLivestreams")

                console.log("-> Draft livestream was updated with id", id);
            } else {
                id = await firebase.addLivestream(livestream, "draftLivestreams")
                console.log("-> Draft livestream was created with id", id);
                push(`/draft-stream?draftStreamId=${id}`)
            }

            if (absolutePath) {
                return push({
                    pathname: absolutePath,
                })
            }
            setDraftId(id)
            setSubmitted(true)
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
            if (status === SAVING_CHANGES) {
                enqueueSnackbar("You changes have been saved!", {
                    variant: "default",
                    preventDuplicate: true,
                });
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


    return (
        <Dialog
            TransitionComponent={Transition}
            onClose={onClose}
            fullScreen
            open={open}
            PaperProps={{
                className: classes.background
            }}
        >
            <AppBar className={classes.appBar} position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon/>
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        New Draft / Stream
                    </Typography>
                    <CardActions>
                        <Button variant="contained" autoFocus color="secondary" onClick={handleSaveChanges}>
                            publish
                        </Button>
                        <Button variant="contained" autoFocus color="primary" onClick={handleSubmit}>
                            save changes
                        </Button>
                    </CardActions>
                </Toolbar>
            </AppBar>
            <DraftStreamForm
                setStatus={setStatus}
                status={status}
                formRef={formRef}
                group={group}
                onSubmit={onSubmit}
                submitted={submitted}
                setSubmitted={setSubmitted}
            />
        </Dialog>
    );
};

export default withFirebase(NewStreamModal);

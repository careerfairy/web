import React, {useContext, useEffect, useState} from 'react';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import {withFirebase} from 'context/firebase';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import ChatEntryContainer from './chat-entry-container/ChatEntryContainer';
import ExpandLessRoundedIcon from '@material-ui/icons/ExpandLessRounded';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Badge,
    Collapse,
    TextField,
    Typography,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import {makeStyles, fade} from "@material-ui/core/styles";
import {grey} from "@material-ui/core/colors";
import TutorialContext from "../../../../../../context/tutorials/TutorialContext";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "../../../../../../materialUI/GlobalTooltips";
import CustomScrollToBottom from "../../../../../util/CustomScrollToBottom";
import {useAuth} from "../../../../../../HOCs/AuthProvider";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    root: {
    },
    accordionRoot:{
        boxShadow: theme.shadows[3],
        background: theme.palette.background.paper
    },
    sendIcon: {
        background: "white",
        color: ({isEmpty}) => isEmpty ? "grey" : theme.palette.primary.main,
        borderRadius: "50%",
        fontSize: 15
    },
    sendBtn: {
        width: 30,
        height: 30,
        background: fade(theme.palette.primary.main, 0.5),
        "&$buttonDisabled": {
            color: grey[800]
        },
        "&:hover": {
            backgroundColor: theme.palette.primary.main,
        },
        margin: "0.5rem"
    },
    buttonDisabled: {},
    chatInput: {
        borderRadius: 10,
        "& .MuiInputBase-root": {
            paddingRight: "0 !important",
            borderRadius: 10,
        },
    },
    header: {
        height: "41px !important",
        padding: "10px 15px",
        "& .MuiAccordionSummary-content": {
            margin: 0,
            display: "flex",
            alignItems: "center"
        },
    },
    expanded: {
        minHeight: "41px !important"
    },
    chatRoom: {
        display: "flex",
        flexDirection: "column",
        padding: 0,
    },
    scrollToBottom: {
        backgroundColor: theme.palette.background.default,
        height: "240px",
        "& div": {
            overflowX: "hidden",
        }
    }
}))

function MiniChatContainer({isStreamer, livestream, firebase, className}) {
    const {authenticatedUser, userData} = useAuth();
    const {tutorialSteps, setTutorialSteps, handleConfirmStep} = useContext(TutorialContext);

    const [chatEntries, setChatEntries] = useState([]);
    const [focused, setFocused] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [numberOfMissedEntries, setNumberOfMissedEntries] = useState(0);
    const [numberOfLatestChanges, setNumberOfLatestChanges] = useState(0);

    const [newChatEntry, setNewChatEntry] = useState('');
    const [open, setOpen] = useState(false);

    const isEmpty = (!(newChatEntry.trim()) || (!userData && !livestream.test && !isStreamer))
    const classes = useStyles({isEmpty})

    useEffect(() => {
        if (livestream.id) {
            const unsubscribe = firebase.listenToChatEntries(livestream.id, 150, querySnapshot => {
                var chatEntries = [];
                querySnapshot.forEach(doc => {
                    let entry = doc.data();
                    entry.id = doc.id;
                    chatEntries.unshift(entry);
                });
                setChatEntries(chatEntries);
                if (!open) {
                    let number = 0;
                    querySnapshot.docChanges().forEach(change => {
                        if (change.type === "added" && number < 99) {
                            number++;
                        }
                    })
                    setNumberOfLatestChanges(number);
                }
            });
            return () => unsubscribe();
        }
    }, [livestream.id]);

    useEffect(() => {
        if (numberOfMissedEntries + numberOfLatestChanges <= 100 && !open) {
            setNumberOfMissedEntries(numberOfMissedEntries + numberOfLatestChanges);
        }
        setNumberOfLatestChanges(0);
    }, [numberOfLatestChanges])

    useEffect(() => {
        if (open) {
            setNumberOfMissedEntries(0);
        }
    }, [open])

    useEffect(() => {
        if (tutorialSteps.streamerReady) {
            setNumberOfMissedEntries(3); // resets the missed entries back to 3
        }
    }, [tutorialSteps.streamerReady])

    const isOpen = (property) => {
        return Boolean(livestream.test
            && tutorialSteps.streamerReady
            && tutorialSteps[property]
        )
    }


    function addNewChatEntry() {
        if (isEmpty || submitting) {
            return;
        }
        setSubmitting(true)

        const newChatEntryObject = {
            message: newChatEntry,
            authorName: isStreamer || livestream.test ? 'Streamer' : userData.firstName + ' ' + userData.lastName.charAt(0),
            authorEmail: isStreamer || livestream.test ? 'Streamer' : authenticatedUser.email,
            votes: 0
        }

        isOpen(15) && handleConfirmStep(15)
        firebase.putChatEntry(livestream.id, newChatEntryObject)
            .then(() => {
                setSubmitting(false)
                setNewChatEntry('');
            }, error => {
                setSubmitting(false)
                console.log("Error: " + error);
            });
    }

    function addNewChatEntryOnEnter(target) {
        if (target.charCode == 13) {
            addNewChatEntry();
            if (isOpen(15)) {
                handleConfirmStep(15)
                // close the chat after two seconds
                setTimeout(() => setOpen(false), 2000)
            }
        }
    }

    let chatElements = chatEntries.map((chatEntry, index) => {
        return (
            <ChatEntryContainer key={chatEntry?.id} chatEntry={chatEntry}/>
        );
    });

    const playIcon = (<div>
        <IconButton classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}} disabled={isEmpty}
                    onClick={() => addNewChatEntry()}>
            <ChevronRightRoundedIcon className={classes.sendIcon}/>
        </IconButton>
    </div>)

    return (
        <div className={clsx(classes.root, className)}>
            <WhiteTooltip
                placement="top"
                title={
                    <React.Fragment>
                        <TooltipTitle>Chat (1/2)</TooltipTitle>
                        <TooltipText>
                            Dont forget you can also interact with your audience
                            through the direct chat room
                        </TooltipText>
                        <TooltipButtonComponent onConfirm={() => {
                            setOpen(true)
                            handleConfirmStep(14)
                        }} buttonText="Ok"/>
                    </React.Fragment>
                } open={isOpen(14)}>
                <Accordion
                    TransitionProps={{unmountOnExit: true}}
                    onChange={() => {
                    !open && isOpen(14) && handleConfirmStep(14)
                    setOpen(!open)
                }}
                    className={classes.accordionRoot}
                    expanded={open}
                >
                    <AccordionSummary className={classes.header}
                                      expandIcon={<ExpandLessRoundedIcon/>}
                                      aria-controls="chat-header"
                                      id="chat-header"
                                      classes={{expanded: classes.expanded}}
                    >
                        <Badge badgeContent={numberOfMissedEntries} color="error">
                            <ForumOutlinedIcon fontSize="small"/>
                        </Badge>
                        <Typography style={{marginLeft: "0.6rem"}}>
                            Chat
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.chatRoom}>
                        <CustomScrollToBottom className={classes.scrollToBottom} scrollItems={chatElements}/>
                        <WhiteTooltip
                            placement="right-start"
                            title={
                                <React.Fragment>
                                    <TooltipTitle>Chat (2/2)</TooltipTitle>
                                    <TooltipText>
                                        Give it a shot!
                                    </TooltipText>
                                </React.Fragment>
                            } open={isOpen(15)}>
                            <div style={{margin: 5}}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    autoFocus
                                    onBlur={() => setFocused(false)}
                                    onFocus={() => setFocused(true)}
                                    className={classes.chatInput}
                                    size="small"
                                    onKeyPress={addNewChatEntryOnEnter}
                                    value={newChatEntry}
                                    onChange={() => setNewChatEntry(event.target.value)}
                                    placeholder='Post in the chat...'
                                    InputProps={{
                                        maxLength: 340,
                                        endAdornment: playIcon,
                                    }}/>
                                <Collapse align="center"
                                          style={{color: "grey", fontSize: "0.8em", marginTop: 3, padding: "0 0.8em"}}
                                          in={focused && !isStreamer}>
                                    For questions, please use the Q&A tool!
                                </Collapse>
                            </div>
                        </WhiteTooltip>
                    </AccordionDetails>
                </Accordion>
            </WhiteTooltip>
        </div>
    );
}

export default withFirebase(MiniChatContainer);
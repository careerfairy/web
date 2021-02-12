import React, {useLayoutEffect, useRef, useState} from 'react';
import {Badge, Button, CircularProgress, Collapse, Paper, TextField, Typography, useTheme} from "@material-ui/core";
import QuestionContainer from './questions/QuestionContainer';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import HelpIcon from '@material-ui/icons/Help';
import DialogTitle from '@material-ui/core/DialogTitle';
import {withFirebase} from 'context/firebase';
import AddIcon from '@material-ui/icons/Add';
import Fab from "@material-ui/core/Fab";
import {
    CategoryContainerTopAligned,
    QuestionContainerHeader,
    QuestionContainerTitle
} from "../../../../materialUI/GlobalContainers";
import SwipeableViews from "react-swipeable-views";
import {TabPanel} from "../../../../materialUI/GlobalPanels/GlobalPanels";
import {fade, makeStyles} from "@material-ui/core/styles";
import CustomInfiniteScroll from "../../../util/CustomInfiteScroll";
import useInfiniteScroll from "../../../custom-hook/useInfiniteScroll";
import {useAuth} from "../../../../HOCs/AuthProvider";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {GreyPermanentMarker} from "../../../../materialUI/GlobalTitles";
import Slide from "@material-ui/core/Slide";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const useStyles = makeStyles(theme => ({
    view: {
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "auto",
        "& .react-swipeable-view-container": {
            height: "100%"
        }
    },
    addIcon: {
        marginRight: theme.spacing(1)
    },
    questionScroll: {
        height: "100%",
        width: "100%",

    },
    emptyMessage: {
        margin: "auto !important"
    },
    viewPanel: {
        display: "flex",
        '& > *': {
            width: "100%"
        }
    },
    fullwidth: {
        width: "100%"
    },
    dialog: {
        backgroundColor: fade(theme.palette.common.black, 0.2),
        backdropFilter: "blur(5px)",
    },
    dialogInput: {
        background: fade(theme.palette.background.paper, 0.5),
    },
    bar: {
        width: "100%",
        background: theme.palette.background.paper,
    },
    tabs: {
        width: ({isMobile}) => isMobile ? "100%" : 280
    }
}))

const EmptyList = ({isUpcoming}) => {
    const classes = useStyles()
    return (
        <GreyPermanentMarker className={classes.emptyMessage}>
            No {isUpcoming ? "upcoming" : "answered"} questions
        </GreyPermanentMarker>
    )
}


function QuestionCategory({livestream, selectedState, sliding, streamer, firebase, showMenu, isMobile}) {
    if (!livestream?.id) {
        return null
    }
    const theme = useTheme()
    const classes = useStyles({isMobile})
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [touched, setTouched] = useState(false);
    const [value, setValue] = useState(0)
    const [parentHeight, setParentHeight] = useState(400)
    const [submittingQuestion, setSubmittingQuestion] = useState(false);

    const [newQuestionTitle, setNewQuestionTitle] = useState("");

    const {authenticatedUser, userData} = useAuth();

    const parentRef = useRef()

    useLayoutEffect(() => {
        function updateSize() {
            setParentHeight(parentRef.current.containerNode.offsetHeight);
        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleOpen = () => {
        setTouched(false)
        setShowQuestionModal(true)
    }
    const handleClose = () => {
        setTouched(false)
        setShowQuestionModal(false)
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    }
    const handleChangeIndex = (index) => {
        setValue(index);
    }


    const [itemsUpcoming, loadMoreUpcoming, hasMoreUpcoming] = useInfiniteScroll(
        firebase.listenToUpcomingLivestreamQuestions(livestream.id), 10
    );

    const [itemsPast, loadMorePast, hasMorePast] = useInfiniteScroll(
        firebase.listenToPastLivestreamQuestions(livestream.id), 10
    );

    const addNewQuestion = async () => {
        setTouched(true)
        if ((!userData && !livestream.test) || !(newQuestionTitle.trim()) || newQuestionTitle.trim().length < 5) {
            return;
        }
        setSubmittingQuestion(true)
        try {
            const newQuestion = {
                title: newQuestionTitle,
                votes: 0,
                type: "new",
                author: !livestream.test ? authenticatedUser.email : 'test@careerfairy.io'
            }
            await firebase.putLivestreamQuestion(livestream.id, newQuestion)
        } catch (e) {
            console.log("Error", e);
        }
        setSubmittingQuestion(false)
        setNewQuestionTitle("");
        handleClose()
    }

    let upcomingQuestionsElements = itemsUpcoming.map((question, index) => {
        return <QuestionContainer key={question.id}
                                  streamer={streamer}
                                  isNextQuestions={value === 0}
                                  livestream={livestream}
                                  index={index} sliding={sliding}
                                  showMenu={showMenu}
                                  selectedState={selectedState}
                                  questions={itemsUpcoming} question={question} user={authenticatedUser}
                                  userData={userData}/>

    });

    let pastQuestionsElements = itemsPast.map((question, index) => {
        return <QuestionContainer key={question.id} streamer={streamer}
                                  isNextQuestions={value === 1}
                                  livestream={livestream}
                                  index={index}
                                  showMenu={showMenu}
                                  selectedState={selectedState}
                                  questions={itemsPast} question={question} user={authenticatedUser}
                                  userData={userData}/>
    });
    const getCount = (isUpcoming) => {
        const elements = isUpcoming ? upcomingQuestionsElements : pastQuestionsElements
        const hasMore = isUpcoming ? hasMoreUpcoming : hasMorePast
        return elements.length ? `${elements.length}${hasMore ? "+" : ""}` : 0
    }
    return (
        <CategoryContainerTopAligned>
            <QuestionContainerHeader>
                <Paper elevation={1} square className={classes.bar}>
                <QuestionContainerTitle>
                    Questions
                </QuestionContainerTitle>
                {!streamer &&
                <Fab onClick={handleOpen} size="medium" color="primary" variant="extended">
                    <AddIcon className={classes.addIcon}/>
                    Add a Question
                </Fab>}
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        variant={isMobile ? "fullWidth" : "standard"}
                        textColor="primary"
                        className={classes.tabs}
                    >
                        <Tab
                            style={{minWidth: "50%"}}
                            label="Upcoming"
                            icon={
                                <Badge color="secondary"
                                       badgeContent={getCount(true)}>
                                    <HelpIcon/>
                                </Badge>
                            }
                        />
                        <Tab
                            style={{minWidth: "50%"}}
                            label="Answered"
                            icon={
                                <Badge color="secondary"
                                       badgeContent={getCount()}>
                                    <CheckCircleIcon/>
                                </Badge>
                            }
                        />
                    </Tabs>
                </Paper>
            </QuestionContainerHeader>
            <SwipeableViews
                containerStyle={{WebkitOverflowScrolling: 'touch'}}
                disabled
                ref={parentRef}
                id="scrollable-container"
                className={classes.view}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value} onChangeIndex={handleChangeIndex}>
                <TabPanel className={classes.viewPanel} value={value} index={0}>
                    {itemsUpcoming.length ?
                        <CustomInfiniteScroll
                            className={classes.questionScroll}
                            height={parentHeight}
                            hasMore={hasMoreUpcoming}
                            next={loadMoreUpcoming}
                            dataLength={itemsUpcoming.length}>
                            {upcomingQuestionsElements}
                        </CustomInfiniteScroll>
                        :
                        <EmptyList isUpcoming/>}
                </TabPanel>
                <TabPanel className={classes.viewPanel} value={value} index={1}>
                    {itemsPast.length ?
                        <CustomInfiniteScroll
                            className={classes.questionScroll}
                            hasMore={hasMorePast}
                            height={parentHeight}
                            next={loadMorePast}
                            dataLength={itemsPast.length}>
                            {pastQuestionsElements}
                        </CustomInfiniteScroll>
                        :
                        <EmptyList/>}
                </TabPanel>
            </SwipeableViews>
            <Dialog TransitionComponent={Slide} PaperProps={{className: classes.dialog}} fullWidth onClose={handleClose}
                    open={showQuestionModal} basic size='small'>
                <DialogTitle style={{color: "white"}}>
                    Add a Question
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        InputProps={{className: classes.dialogInput}}
                        error={Boolean(touched && newQuestionTitle.length < 5)}
                        onBlur={() => setTouched(true)}
                        variant="outlined" value={newQuestionTitle} placeholder='Your question goes here'
                        onChange={({currentTarget: {value}}, element) => {
                            setNewQuestionTitle(value)
                        }} fullWidth/>
                    <Collapse in={Boolean(touched && newQuestionTitle.length < 4)}>
                        <Typography style={{paddingLeft: "1rem"}} color="error">
                            Needs to be at least 5 characters
                        </Typography>
                    </Collapse>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" size='large'
                            disabled={submittingQuestion}
                            onClick={() => addNewQuestion()}>
                        {submittingQuestion ? <CircularProgress color="inherit" size={20}/> : "Submit"}
                    </Button>
                    <Button variant="contained" size='large' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </CategoryContainerTopAligned>
    );
}

export default withFirebase(QuestionCategory);
import React, {useState, useEffect, useContext, useRef, useLayoutEffect} from 'react';
import UserContext from 'context/user/UserContext';
import {Button, Grid, Typography, useTheme} from "@material-ui/core";
import QuestionContainer from './questions/QuestionContainer';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import {TextField, Collapse} from "@material-ui/core";

import DialogTitle from '@material-ui/core/DialogTitle';
import {withFirebase} from 'context/firebase';
import AddIcon from '@material-ui/icons/Add';
import Fab from "@material-ui/core/Fab";
import Box from "@material-ui/core/Box";
import {
    CategoryContainerTopAligned,
    QuestionContainerHeader,
    QuestionContainerTitle
} from "../../../../materialUI/GlobalContainers";
import SwipeableViews from "react-swipeable-views";
import {TabPanel} from "../../../../materialUI/GlobalPanels/GlobalPanels";
import {makeStyles} from "@material-ui/core/styles";

import CustomInfiniteScroll from "../../../util/CustomInfiteScroll";
import useInfiniteScroll from "../../../custom-hook/useInfiniteScroll";

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
}))

function QuestionCategory({livestream, selectedState, sliding, streamer, firebase, showMenu}) {
    if (!livestream?.id) {
        return null
    }
    const theme = useTheme()
    const classes = useStyles()
    const [showNextQuestions, setShowNextQuestions] = useState(true);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [touched, setTouched] = useState(false);
    const [value, setValue] = useState(0)
    const [parentHeight, setParentHeight] = useState(400)

    const [newQuestionTitle, setNewQuestionTitle] = useState("");

    const {authenticatedUser, userData} = useContext(UserContext);

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

    const handleChange = (event) => {
        setValue(showNextQuestions ? 0 : 1);
        setShowNextQuestions(!showNextQuestions);
    }




    const [itemsUpcoming, loadMoreUpcoming, hasMoreUpcoming] = useInfiniteScroll(
        firebase.listenToUpcomingLivestreamQuestions(livestream.id), 10
    );

    const [itemsPast, loadMorePast, hasMorePast] = useInfiniteScroll(
        firebase.listenToPastLivestreamQuestions(livestream.id), 10
    );

    const handleClickUpcoming = () => {
        setShowNextQuestions(true)
        setValue(0)
    }

    const handleClickPast = () => {
        setShowNextQuestions(false)
        setValue(1)
    }

    function addNewQuestion() {
        setTouched(true)
        if ((!userData && !livestream.test) || !(newQuestionTitle.trim()) || newQuestionTitle.trim().length < 5) {
            return;
        }

        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: !livestream.test ? authenticatedUser.email : 'test@careerfairy.io'
        }
        firebase.putLivestreamQuestion(livestream.id, newQuestion)
            .then(() => {
                setNewQuestionTitle("");
                handleClose()
            }, () => {
                console.log("Error");
            })
    }

    let upcomingQuestionsElements = itemsUpcoming.map((question, index) => {
        return <QuestionContainer key={question.id} showNextQuestions={showNextQuestions}
                                  streamer={streamer}
                                  isNextQuestions={showNextQuestions}
                                  livestream={livestream}
                                  index={index} sliding={sliding}
                                  showMenu={showMenu}
                                  selectedState={selectedState}
                                  questions={itemsUpcoming} question={question} user={authenticatedUser}
                                  userData={userData}/>

    });

    let pastQuestionsElements = itemsPast.map((question, index) => {
        return <QuestionContainer key={question.id} showNextQuestions={showNextQuestions} streamer={streamer}
                                  isNextQuestions={!showNextQuestions}
                                  livestream={livestream}
                                  index={index}
                                  showMenu={showMenu}
                                  selectedState={selectedState}
                                  questions={itemsPast} question={question} user={authenticatedUser}
                                  userData={userData}/>
    });


    return (
        <CategoryContainerTopAligned>
            <QuestionContainerHeader style={streamer ? {} : {height: 180, padding: 8}}>
                <QuestionContainerTitle>
                    Questions
                </QuestionContainerTitle>
                {!streamer &&
                <Button variant="contained" children='Add a Question'
                        endIcon={<AddIcon fontSize="large"/>}
                        color="primary" onClick={handleOpen}/>}
                <div style={{display: "flex", justifyContent: "center"}}>
                    <Fab size="small" variant="extended" onClick={handleClickUpcoming} value="left"
                         style={{
                             background: showNextQuestions ? "Gray" : "#e0e0e0",
                             marginRight: "0.5rem",
                             color: showNextQuestions ? "white" : "black"
                         }}>
                        <Box fontSize={10}>Upcoming [{upcomingQuestionsElements.length}{hasMoreUpcoming && "+"}]</Box>
                    </Fab>
                    <Fab size="small" variant="extended" onClick={handleClickPast} value="center"
                         style={{
                             background: showNextQuestions ? "#E0E0E0" : "Gray",
                             marginLeft: "0.5rem",
                             color: showNextQuestions ? "black" : "white"
                         }}>
                        <Box fontSize={10}>Answered [{pastQuestionsElements.length}{hasMorePast && "+"}]</Box>
                    </Fab>
                </div>
            </QuestionContainerHeader>
            <SwipeableViews
                containerStyle={{WebkitOverflowScrolling: 'touch'}}
                disabled
                ref={parentRef}
                id="scrollable-container"
                className={classes.view}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value} onChangeIndex={handleChange}>
                <TabPanel>
                    <CustomInfiniteScroll
                        height={parentHeight}
                        hasMore={hasMoreUpcoming}
                        next={loadMoreUpcoming}
                        dataLength={itemsUpcoming.length}>
                        {upcomingQuestionsElements}
                    </CustomInfiniteScroll>
                </TabPanel>
                <TabPanel>
                    <CustomInfiniteScroll
                        hasMore={hasMorePast}
                        height={parentHeight}
                        next={loadMorePast}
                        dataLength={itemsPast.length}>
                        {pastQuestionsElements}
                    </CustomInfiniteScroll>
                </TabPanel>
            </SwipeableViews>
            <Dialog PaperProps={{style: {background: "transparent", boxShadow: "none"}}} fullWidth onClose={handleClose}
                    open={showQuestionModal} basic size='small'>
                <DialogTitle style={{color: "white"}}>
                    Add a Question
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        InputProps={{style: {background: "white"}}}
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
                            onClick={() => addNewQuestion()}>
                        Submit
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
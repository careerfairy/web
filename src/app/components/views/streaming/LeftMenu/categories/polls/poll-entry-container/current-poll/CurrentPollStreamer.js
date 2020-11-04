import React, {Fragment, useContext, useEffect, useState} from 'react';
import {withFirebase} from 'context/firebase';
import CurrentPollGraph from "../../../../../sharedComponents/CurrentPollGraph";
import {Box, Button, Fab} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";
import Tooltip from "@material-ui/core/Tooltip";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {makeStyles} from "@material-ui/core/styles";
import TutorialContext from "../../../../../../../../context/tutorials/TutorialContext";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "../../../../../../../../materialUI/GlobalTooltips";

function getRandomInt(min, max, index) {
    return (Math.floor((Math.random() * (max - min + 1) + min) / (index + 1)));
}

const useStyles = makeStyles(theme => ({
    demoFab: {
        position: "absolute",
        top: 3,
        right: 3,
        background: ({demoMode}) => demoMode ? "white" : theme.palette.secondary.main,
        "&:hover": {
            background: ({demoMode}) => demoMode ? "white" : theme.palette.secondary.dark,
        }
    },
    demoIcon: {
        color: ({demoMode}) => demoMode ? theme.palette.secondary.main : "white"
    }
}))

function CurrentPollStreamer({demoPolls, sliding, firebase, livestream, showMenu, selectedState, addNewPoll, poll, index}) {
    const [currentPoll, setCurrentPoll] = useState(null)
    const [demoMode, setDemoMode] = useState(false)
    const [numberOfTimes, setNumberOfTimes] = useState(0)
    const classes = useStyles({demoMode})

    const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);

    const isOpen = (property) => {
        return Boolean(livestream.test
            && index === 0
            && showMenu
            && tutorialSteps.streamerReady
            && tutorialSteps[property]
            && selectedState === "polls"
            && !addNewPoll
            && !sliding
        )
    }

    const handleConfirm = (property) => {
        setTutorialSteps({
            ...tutorialSteps,
            [property]: false,
            [property + 1]: true,
        })
    }

    useEffect(() => {
        if (demoPolls) {
            setDemoMode(true)
        }
    }, [demoPolls])

    useEffect(() => {
        if (poll && !demoMode) {
            setCurrentPoll(poll)
        }
    }, [poll])

    useEffect(() => {
        if (numberOfTimes >= 20) {
            setDemoMode(false)
        }
    }, [numberOfTimes])

    useEffect(() => {
        if (demoMode) {
            const interval = setInterval(() => {
                simulatePollVotes()
            }, 100);
            return () => clearInterval(interval)
        }
    }, [demoMode])

    function setPollState(state) {
        firebase.setPollState(livestream.id, poll.id, state);
    }

    let totalVotes = 0;
    poll.options.forEach(option => totalVotes += option.votes);

    const resetPoll = () => {
        const newCurrentPoll = {...currentPoll}
        newCurrentPoll.options = newCurrentPoll.options.map((option, index) => ({
            ...option,
            votes: 0
        }))
        setCurrentPoll(newCurrentPoll)
    }

    const simulatePollVotes = () => {
        const newCurrentPoll = {...currentPoll}
        newCurrentPoll.options = newCurrentPoll.options.map((option, index) => ({
            ...option,
            votes: option.votes += getRandomInt(1, 4, index)
        }))
        setNumberOfTimes(count => count + 1)
        setCurrentPoll(newCurrentPoll)
    }

    const handleToggle = () => {
        resetPoll()
        setNumberOfTimes(0)
        setDemoMode(!demoMode)
    }

    // const DemoPollsButton = livestream.test ? (
    //     <Tooltip title="Demo Polls">
    //         <Fab className={classes.demoFab} onClick={handleToggle} color="secondary" size="small">
    //             <AllInclusiveIcon className={classes.demoIcon}/>
    //         </Fab>
    //     </Tooltip>
    // ) : null

    return (
        <Fragment>
            <div>
                <div className='chat-entry-container'>
                    <div className='poll-label'>ACTIVE POLL</div>
                    {currentPoll && <CurrentPollGraph currentPoll={currentPoll}/>}
                    <WhiteTooltip
                        placement="right-start"
                        title={
                            <React.Fragment>
                                <TooltipTitle>Polls (4/4)</TooltipTitle>
                                <TooltipText>
                                    One your audience has voted you can now close the poll.
                                </TooltipText>
                                <TooltipButtonComponent onConfirm={() => {
                                    setPollState('closed')
                                    handleConfirm(7)
                                }} buttonText="Ok"/>
                            </React.Fragment>
                        } open={isOpen(7)}>
                        <Button fullWidth children={'Close Poll'} variant="contained" color="primary"
                                onClick={() => {
                                    setPollState('closed')
                                    isOpen(7) && handleConfirm(7)
                                }}
                                style={{borderRadius: '0 0 15px 15px'}}/>
                    </WhiteTooltip>
                </div>
            </div>
            <style jsx>{`
                .chat-entry-container {
                    border-radius: 15px;
                    box-shadow: 0 0 5px rgb(180,180,180);
                    margin: 10px 10px 0 10px;
                    padding: 12px 0 0 0;
                    background-color: white;
                    position: relative;
                }

                .popup {
                    position: fixed;
                    bottom: 20px;
                    left: 300px;
                    width: 400px;
                    z-index: 9000;
                    padding: 30px;
                    border-radius: 10px;
                    background-color: white;
                }

                .popup .name {
                    font-size: 1.6em;
                    margin: 10px 0 30px 0;
                    font-weight: 700;
                    color: rgb(0, 210, 170);
                }

                .poll-label {
                    color: grey;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 10px;
                }

                .poll-entry-message {
                    font-weight: 700;
                    font-size: 1.4em;
                    margin: 5px 0 25px 0;
                }

                .chat-entry-author {
                    font-size: 0.8em;
                    color: rgb(180,180,180);
                }
            `}</style>
        </Fragment>
    );
}

export default withFirebase(CurrentPollStreamer);
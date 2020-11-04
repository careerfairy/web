import React, {Fragment, useEffect, useState} from 'react';
import {withFirebase} from 'context/firebase';
import CurrentPollGraph from "../../../../../sharedComponents/CurrentPollGraph";
import {Box, Button, Fab} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";
import Tooltip from "@material-ui/core/Tooltip";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {makeStyles} from "@material-ui/core/styles";

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

function CurrentPollStreamer(props) {
    const [currentPoll, setCurrentPoll] = useState(null)
    const [demoMode, setDemoMode] = useState(false)
    const [numberOfTimes, setNumberOfTimes] = useState(0)
    const classes = useStyles({demoMode})

    useEffect(() => {
        if (props.demoPolls) {
            setDemoMode(true)
        }
    }, [props.demoPolls])

    useEffect(() => {
        if (props.poll && !demoMode) {
            setCurrentPoll(props.poll)
        }
    }, [props.poll])

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
        props.firebase.setPollState(props.livestream.id, props.poll.id, state);
    }

    let totalVotes = 0;
    props.poll.options.forEach(option => totalVotes += option.votes);

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

    // const DemoPollsButton = props.livestream.test ? (
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
                    {/*{DemoPollsButton}*/}
                    {currentPoll && <CurrentPollGraph currentPoll={currentPoll}/>}
                    <Button fullWidth children={'Close Poll'} variant="contained" color="primary"
                            onClick={() => setPollState('closed')}
                            style={{borderRadius: '0 0 5px 5px', marginTop: 12}}/>
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
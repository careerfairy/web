import PropTypes from 'prop-types'
import React, {useEffect, useMemo, useState} from 'react';
import {withFirebase} from 'context/firebase';
import CurrentPollGraph from "../../../streaming/sharedComponents/CurrentPollGraph";
import {Grow, Paper} from "@material-ui/core";
import {GreyPermanentMarker, PollQuestion} from "../../../../../materialUI/GlobalTitles";
import {CategoryContainerCentered} from "../../../../../materialUI/GlobalContainers";
import {colorsArray} from "../../../../util/colors";
import {useAuth} from "../../../../../HOCs/AuthProvider";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {DynamicColorButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";
import PollUtil, {getCorrectPollOptionData} from "../../../../../data/util/PollUtil";
import {getRandomInt, getRandomWeightedInt, isServer} from "../../../../helperFunctions/HelperFunctions";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import {v4 as uuidv4} from 'uuid'
import Zoom from 'react-reveal/Zoom';


const usePollWrapperStyles = makeStyles(theme => ({
    root: {
        borderRadius: 15,
        margin: 10,
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        width: "90%",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: theme.spacing(2, 0),
        boxShadow: theme.shadows[3]
    },
}))

const PollWrapper = ({children, ...rest}) => {
    const classes = usePollWrapperStyles()
    return (
        <Paper {...rest} className={classes.root}>
            {children}
        </Paper>
    )
}

PollWrapper.propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.object
}

const useStyles = makeStyles(theme => ({
    pollButton: {
        marginTop: theme.spacing(1)
    }
}))


const PollOptionsDisplay = ({currentPoll, voting, voteForPollOption}) => {
    const theme = useTheme()
    const classes = useStyles()
    return (
        <CategoryContainerCentered>
            <PollWrapper style={{padding: theme.spacing(2)}}>
                <PollQuestion style={{margin: "1.5rem 0"}}>
                    {currentPoll?.question}
                </PollQuestion>
                <div>
                    {currentPoll?.options?.map((option, index) => {
                        return (
                            <DynamicColorButton
                                key={option.id}
                                variant="contained"
                                loading={voting}
                                className={classes.pollButton}
                                color={colorsArray[index]}
                                fullWidth
                                disabled={voting}
                                onClick={() => voteForPollOption(option.id)}
                                size='small'>
                                <span key={`${option.text}-span`}>
                                {option.text}
                                </span>
                            </DynamicColorButton>
                        );
                    })}
                </div>
            </PollWrapper>
        </CategoryContainerCentered>
    )
}

PollOptionsDisplay.propTypes = {
    currentPoll: PropTypes.object,
    voteForPollOption: PropTypes.func,
    voting: PropTypes.bool
}

const PollDisplay = ({currentPoll}) => {

    return (
        <CategoryContainerCentered>
            <PollWrapper>
                {(currentPoll && !isServer()) && <CurrentPollGraph currentPoll={currentPoll}/>}
            </PollWrapper>
        </CategoryContainerCentered>
    )
}

PollDisplay.propTypes = {
    currentPoll: PropTypes.object
}

const NoPollDisplay = () => {
    return (
        <CategoryContainerCentered>
            <GreyPermanentMarker>
                No current poll
            </GreyPermanentMarker>
        </CategoryContainerCentered>
    )
}
const PollCategory = ({firebase, livestream, setSelectedState, setShowMenu}) => {
    const {authenticatedUser} = useAuth();
    const [currentPoll, setCurrentPoll] = useState(null);
    const [currentPollId, setCurrentPollId] = useState(null);
    const [voting, setVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [value, setValue] = useState(0);
    let authEmail = (authenticatedUser && authenticatedUser.email && !livestream.test) ? authenticatedUser.email : 'streamerEmail';

    useEffect(() => {
        if (livestream) {
            firebase.listenToPolls(livestream.id, querySnapshot => {
                let pollSwitch = null;
                querySnapshot.forEach(doc => {
                    let poll = doc.data();
                    poll.options = getCorrectPollOptionData(poll)
                    if (poll.state === 'current') {
                        poll.id = doc.id;
                        pollSwitch = poll;
                    }
                });
                return setCurrentPoll(pollSwitch);
            });
        }
    }, [livestream]);

    useEffect(() => {
        if (currentPoll && currentPoll.id !== currentPollId) {
            setSelectedState("polls");
            setShowMenu(true);
            setCurrentPollId(currentPoll.id);
        }
    }, [currentPoll]);

    useEffect(() => {
        if (currentPoll?.id) {
            const unsubscribe = firebase.listenToVoteOnPoll(livestream.id, currentPoll.id, authEmail, querySnapshot => {
                setHasVoted(querySnapshot.exists)
            })
            return () => unsubscribe()
        } else {
            setHasVoted(false)
        }
    }, [currentPoll?.id, authEmail]);

    useEffect(() => {
        if (!Boolean(currentPoll && authEmail)) {
            setValue(0)
        } else if (!hasVoted) {
            setValue(1)
        } else if (hasVoted) {
            setValue(2)
        } else {
            setValue(0)
        }

    }, [currentPoll, authEmail, hasVoted])

    // useEffect(() => {
    //     if (currentPoll?.id && !stopVoting && authenticatedUser?.email === "kadirit@hotmail.com") {
    //         const maxVotes = 100
    //         let numberOfVotes = 0
    //         const interval = setInterval(() => {
    //             if (numberOfVotes >= maxVotes) {
    //                 setStopVoting(true)
    //             } else {
    //                 numberOfVotes += 1
    //                 spamRandomVotes()
    //             }
    //         }, [50])
    //
    //         return () => clearInterval(interval)
    //     }
    // }, [currentPoll?.id, stopVoting, authenticatedUser?.email]);


    /**
     * @param {string} optionId - Id of the option you wish to vote for
     */
    const voteForPollOption = async (optionId) => {
        let authEmail = livestream.test ? 'streamerEmail' : authenticatedUser.email;
        if (authEmail) {
            setVoting(true)
            await firebase.voteForPollOption(livestream.id, currentPoll.id, authEmail, optionId);
            setVoting(false)
        }
    }


    const renderPollView = (value) => {
        switch (value) {
            case 0:
                return <NoPollDisplay/>;
            case 1:
                return <PollOptionsDisplay
                    currentPoll={currentPoll}
                    voteForPollOption={voteForPollOption}
                    voting={voting}
                />;
            case 2:
                return <PollDisplay currentPoll={currentPoll}/>;
            default:
                return <NoPollDisplay/>;
        }
    }

    return (<React.Fragment>
        {renderPollView(value)}
    </React.Fragment>)
}

PollCategory.propTypes = {
    firebase: PropTypes.any,
    livestream: PropTypes.object.isRequired,
    setSelectedState: PropTypes.func.isRequired,
    setShowMenu: PropTypes.func.isRequired
}
export default withFirebase(PollCategory);

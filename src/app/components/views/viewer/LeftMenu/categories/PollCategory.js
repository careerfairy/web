import PropTypes from 'prop-types'
import React, {useEffect, useMemo, useState} from 'react';
import {withFirebase} from 'context/firebase';
import CurrentPollGraph from "../../../streaming/sharedComponents/CurrentPollGraph";
import {Paper} from "@material-ui/core";
import {GreyPermanentMarker, PollQuestion} from "../../../../../materialUI/GlobalTitles";
import {CategoryContainerCentered} from "../../../../../materialUI/GlobalContainers";
import {colorsArray} from "../../../../util/colors";
import {useAuth} from "../../../../../HOCs/AuthProvider";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {DynamicColorButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";
import PollUtil from "../../../../../data/util/PollUtil";
import {isServer} from "../../../../helperFunctions/HelperFunctions";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";

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
    console.log("-> currentPoll", currentPoll);
    return (
        <CategoryContainerCentered>
            <PollWrapper style={{padding: theme.spacing(2)}}>
                <PollQuestion style={{margin: "1.5rem 0"}}>
                    {currentPoll?.question}
                </PollQuestion>
                <div>
                    {currentPoll?.options?.map((option, index) => {
                        console.log("-> option", option);
                        return (
                            <DynamicColorButton
                                key={option}
                                variant="contained"
                                loading={voting}
                                className={classes.pollButton}
                                color={colorsArray[index]}
                                fullWidth
                                disabled={voting}
                                onClick={() => voteForPollOption(option)}
                                size='small'>
                                <span key={`${option}-span`}>
                                {option}
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
    const {currentLivestream} = useCurrentStream()
    const [currentPoll, setCurrentPoll] = useState(null);
    const [currentPollId, setCurrentPollId] = useState(null);
    const [voting, setVoting] = useState(false);
    const [totalVoters, setTotalVoters] = useState([]);

    useEffect(() => {
        if(currentPoll?.id){
            const unsubscribe = firebase.listenToPollVoters(currentLivestream.id, currentPoll.id, querySnapshot => {
                setTotalVoters(querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
            })
            return () => unsubscribe()
        } else {
            setTotalVoters([])
        }
    },[currentPoll?.id])

    useEffect(() => {
        if (livestream) {
            firebase.listenToPolls(livestream.id, querySnapshot => {
                let pollSwitch = null;
                querySnapshot.forEach(doc => {
                    let poll = doc.data();
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

    const voteForPollOption = async (option) => {
        let authEmail = livestream.test ? 'streamerEmail' : authenticatedUser.email;
        if (authEmail) {
            setVoting(true)
            await firebase.voteForPollOption(livestream.id, currentPoll.id, authEmail, option);
            setVoting(false)
        }
    }

    let authEmail = (authenticatedUser && authenticatedUser.email && !livestream.test) ? authenticatedUser.email : 'streamerEmail';
    const hasVoted = useMemo(() => totalVoters.some(voter => voter.id === authEmail), [authEmail, totalVoters])
    console.log("-> hasVoted", hasVoted);

    const renderPollComponent = () => {
        switch (true) {
            case !Boolean(currentPoll && authEmail) :
                return <NoPollDisplay/>
            case !hasVoted:
                return (<PollOptionsDisplay
                    currentPoll={currentPoll}
                    voteForPollOption={voteForPollOption}
                    voting={voting}
                />)
            case hasVoted:
                return (<PollDisplay currentPoll={currentPoll}/>)
            default:
                return <NoPollDisplay/>;
        }
    }


    return (
        <>
            {renderPollComponent()}
        </>
    )
}
PollCategory.propTypes = {
    firebase: PropTypes.any,
    livestream: PropTypes.object.isRequired,
    setSelectedState: PropTypes.func.isRequired,
    setShowMenu: PropTypes.func.isRequired
}
export default withFirebase(PollCategory);

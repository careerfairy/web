import PropTypes from 'prop-types'
import React, {useEffect, useMemo, useState} from 'react';
import {withFirebase} from 'context/firebase';
import CurrentPollGraph from "../../../streaming/sharedComponents/CurrentPollGraph";
import {Paper} from "@material-ui/core";
import {GreyPermanentMarker, PollQuestion} from "../../../../../materialUI/GlobalTitles";
import {CategoryContainerCentered} from "../../../../../materialUI/GlobalContainers";
import {colorsArray} from "../../../../util/colors";
import {useAuth} from "../../../../../HOCs/AuthProvider";
import {makeStyles, useTheme, withStyles} from "@material-ui/core/styles";
import {DynamicColorButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";
import PollUtil from "../../../../../data/util/PollUtil";
import {isServer} from "../../../../helperFunctions/HelperFunctions";

const PollWrapper = withStyles(theme => ({
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
}))(Paper);
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
                    {currentPoll?.options?.map((option) => {
                        return (
                            <DynamicColorButton
                                key={option.index}
                                variant="contained"
                                loading={voting}
                                className={classes.pollButton}
                                color={colorsArray[option.index]}
                                children={option.name}
                                fullWidth
                                disabled={voting}
                                onClick={() => voteForPollOption(option.index)}
                                size='small'/>
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

    useEffect(() => {
        if (livestream) {
            firebase.listenToPolls(livestream.id, querySnapshot => {
                let pollSwitch = null;
                querySnapshot.forEach(doc => {
                    let poll = doc.data();
                    poll.options = PollUtil.convertPollOptionsObjectToArray(poll.options)
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

    const voteForPollOption = async (index) => {
        let authEmail = livestream.test ? 'streamerEmail' : authenticatedUser.email;
        if (authEmail) {
            setVoting(true)
            await firebase.voteForPollOption(livestream.id, currentPoll.id, authEmail, index);
            setVoting(false)
        }
    }

    let authEmail = (authenticatedUser && authenticatedUser.email && !livestream.test) ? authenticatedUser.email : 'streamerEmail';
    const hasVoted = useMemo(() => currentPoll?.voters?.indexOf(authEmail) > -1, [authEmail, currentPoll?.voters])

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


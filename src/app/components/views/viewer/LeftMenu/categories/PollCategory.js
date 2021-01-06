import React, {useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import CurrentPollGraph from "../../../streaming/sharedComponents/CurrentPollGraph";
import {Button, Paper, useTheme, withStyles} from "@material-ui/core";
import {GreyPermanentMarker, PollQuestion} from "../../../../../materialUI/GlobalTitles";
import {CategoryContainerCentered} from "../../../../../materialUI/GlobalContainers";
import {colorsArray} from "../../../../util/colors";
import {useAuth} from "../../../../../HOCs/AuthProvider";

const PollWrapper = withStyles(theme => ({
    root: {
        borderRadius: 15,
        margin: 10,
        backgroundColor: "white",
        display: "flex",
        width: "90%",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: theme.spacing(2, 0)
    },
}))(Paper);


function PollCategory({firebase, livestream, setSelectedState, setShowMenu}) {
    const theme = useTheme()
    const {authenticatedUser} = useAuth();
    const [currentPoll, setCurrentPoll] = useState(null);
    const [currentPollId, setCurrentPollId] = useState(null);

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

    function voteForPollOption(index) {
        let authEmail = livestream.test ? 'streamerEmail' : authenticatedUser.email;
        firebase.voteForPollOption(livestream.id, currentPoll.id, authEmail, index);
    }

    let authEmail = (authenticatedUser && authenticatedUser.email && !livestream.test) ? authenticatedUser.email : 'streamerEmail';

    if (currentPoll && authEmail) {
        if (currentPoll.voters.indexOf(authEmail) === -1) {
            let optionElementsLarge = currentPoll.options.map((option, index) => {
                return (
                    <Button key={index} variant="contained" children={option.name} fullWidth
                            style={{background: colorsArray[index], color: "white", marginTop: "0.5rem"}}
                            onClick={() => voteForPollOption(index)}
                            size='small'/>
                );
            });
            return (
                <CategoryContainerCentered>
                    <PollWrapper style={{padding: theme.spacing(2)}}>
                        <PollQuestion style={{ margin: "1.5rem 0"}}>
                            {currentPoll.question}
                        </PollQuestion>
                        <div>
                            {optionElementsLarge}
                        </div>
                    </PollWrapper>
                </CategoryContainerCentered>
            );
        } else {
            return (
                <CategoryContainerCentered>
                    <PollWrapper>
                        <CurrentPollGraph currentPoll={currentPoll}/>
                    </PollWrapper>
                </CategoryContainerCentered>
            )

        }
    } else {
        return (
            <CategoryContainerCentered>
                <GreyPermanentMarker>
                    No current poll
                </GreyPermanentMarker>
            </CategoryContainerCentered>
        );
    }
}

export default withFirebase(PollCategory);
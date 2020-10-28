import React, {useState, useEffect} from 'react';

import {withFirebase} from 'context/firebase';
import UserContext from 'context/user/UserContext';
import CurrentPollGraph from "../../../streaming/sharedComponents/CurrentPollGraph";
import {Button, Typography} from "@material-ui/core";

function PollCategory({firebase, selectedState, livestream, setSelectedState, disableSwitching, setShowMenu}) {

    const {authenticatedUser, userData} = React.useContext(UserContext);
    const [currentPoll, setCurrentPoll] = useState(null);
    const [currentPollId, setCurrenPollId] = useState(null);

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
        // debugger
        if (currentPoll && currentPoll.id !== currentPollId) {
            setSelectedState("polls");
            setShowMenu(true);
            setCurrenPollId(currentPoll.id);
        }
    }, [currentPoll]);

    function voteForPollOption(index) {
        let authEmail = livestream.test ? 'streamerEmail' : authenticatedUser.email;
        firebase.voteForPollOption(livestream.id, currentPoll.id, authEmail, index);
    }

    let authEmail = (authenticatedUser && authenticatedUser.email && !livestream.test) ? authenticatedUser.email : 'streamerEmail';

    if (currentPoll && authEmail) {
        if (currentPoll.voters.indexOf(authEmail) === -1) {
            const colors = ['#E74C3C', '#E67E22', '#FFCE56', '#27AE60'];
            let optionElementsLarge = currentPoll.options.map((option, index) => {
                return (
                    <div key={index} style={{margin: "10px 10px 0 0"}}>
                        <Button variant="contained" children={option.name} fullWidth
                                style={{background: colors[index], color: "white"}}
                                onClick={() => voteForPollOption(index)}
                                size='small'/>
                    </div>
                );
            });
            return (
                <>
                    <div className='handraise-container'>
                        <div className='central-container'>
                            <Typography style={{fontFamily: "Permanent Marker", fontSize: "2.5em"}} variant="h3"
                                        gutterBottom>{currentPoll.question}</Typography>
                            <div>
                                {optionElementsLarge}
                            </div>
                        </div>
                    </div>
                    <style jsx>{`
                        .handraise-container {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            height: 100%;
                        }

                        .central-container {
                            text-align: center;
                            width: 90%;
                            color: rgb(0, 210, 170);
                        }

                        .central-container h2 {
                            font-family: 'Permanent Marker';
                            font-size: 2.5em;
                            margin: 20px 0;
                        }
                `}</style>
                </>
            );
        } else {
            return <CurrentPollGraph background="rgb(240,240,240)"
                                  currentPoll={currentPoll}/>

        }
    } else {
        return (
            <div className='handraise-container'>
                <div className='central-container'>
                    <h2>No current poll</h2>
                </div>
                <style jsx>{`
                    .handraise-container {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }

                    .central-container {
                        text-align: center;
                        width: 90%;
                        color: grey;
                    }

                    .central-container h2 {
                        font-family: 'Permanent Marker';
                        font-size: 2.6em;
                    }

                    .central-container p {
                        margin: 20px 0 30px 0;
                    }
            `}</style>
            </div>
        );
    }
}

export default withFirebase(PollCategory);
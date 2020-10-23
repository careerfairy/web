import React, {useState, useEffect} from 'react';

import {withFirebase} from 'context/firebase';
import UserContext from 'context/user/UserContext';
import CurrentPollGraph from "./CurrentPollGraph";
import {Button, Typography} from "@material-ui/core";

function PollCategory({firebase, selectedState, livestream, setSelectedState, setShowMenu}) {

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
                <div style={{display: (selectedState !== 'polls' ? 'none' : 'block')}}>
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
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-color: rgb(240,240,240);
                        }

                        .central-container {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%,-50%);
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
                </div>
            );
        } else {
            return selectedState === 'polls' &&
                <CurrentPollGraph background="rgb(240,240,240)"
                    currentPoll={currentPoll}/>
        }
    } else {
        return (<div style={{display: (selectedState !== 'polls' ? 'none' : 'block')}}>
                <div className='handraise-container'>
                    <div className='central-container'>
                        <h2>No current poll</h2>
                    </div>
                </div>
                <style jsx>{`
                    .handraise-container {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgb(240,240,240);
                    }

                    .central-container {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%,-50%);
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
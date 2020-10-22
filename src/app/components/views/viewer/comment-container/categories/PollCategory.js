import React, {useState, useEffect, Fragment} from 'react';

import {withFirebase} from 'context/firebase';
import UserContext from 'context/user/UserContext';
import PollOptionResultViewer
    from 'components/views/streaming/comment-container/categories/polls/poll-entry-container/current-poll/PollOptionResultViewer';
import CurrentPollGraph from "./CurrentPollGraph";
import {Button, Typography} from "@material-ui/core";

function PollCategory(props) {

    const {authenticatedUser, userData} = React.useContext(UserContext);
    const [currentPoll, setCurrentPoll] = useState(null);
    const [currentPollId, setCurrenPollId] = useState(null);

    useEffect(() => {
        if (props.livestream) {
            props.firebase.listenToPolls(props.livestream.id, querySnapshot => {
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
    }, [props.livestream]);

    useEffect(() => {
        if (currentPoll && currentPoll.id !== currentPollId) {
            props.setSelectedState("polls");
            props.setShowMenu(true);
            setCurrenPollId(currentPoll.id);
        }
    }, [currentPoll]);

    function voteForPollOption(index) {
        let authEmail = props.livestream.test ? 'streamerEmail' : authenticatedUser.email;
        // let authEmail = authenticatedUser.email;
        props.firebase.voteForPollOption(props.livestream.id, currentPoll.id, authEmail, index);
    }

    let authEmail = (authenticatedUser && authenticatedUser.email && !props.livestream.test) ? authenticatedUser.email : 'streamerEmail';
    // let authEmail = (authenticatedUser && authenticatedUser.email) ? authenticatedUser.email : 'streamerEmail';

    if (currentPoll && authEmail) {
        if (currentPoll.voters.indexOf(authEmail) === -1) {
            const colors = ['#E74C3C', '#E67E22', '#FFCE56', '#27AE60'];
            let optionElementsLarge = currentPoll.options.map((option, index) => {
                return (
                    <Fragment key={index}>
                        <div className='option-container'>
                            <Button variant="contained" children={option.name} fullWidth style={{background: colors[index], color: "white"}} onClick={() => voteForPollOption(index)}
                                    size='small'/>
                        </div>
                        <style jsx>{`
                            .option-container {
                                margin: 10px 10px 0 0;
                            }
                        `}</style>
                    </Fragment>
                );
            });
            return (
                <div style={{display: (props.selectedState !== 'polls' ? 'none' : 'block')}}>
                    <div className='handraise-container'>
                        <div className='central-container'>
                            <Typography style={{fontFamily: "Permanent Marker", fontSize: "2.5em"}} variant="h3" gutterBottom>{currentPoll.question}</Typography>
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
            return (
                <CurrentPollGraph currentPoll={currentPoll}/>
            )
            console.log("-> currentPoll", currentPoll);
            let optionElementsLarge = currentPoll.options.map((option, index) => {
                let totalVotes = 0;
                currentPoll.options.forEach(option => totalVotes += option.votes);
                return (
                    <Fragment key={index}>
                        <PollOptionResultViewer option={option} index={index} totalVotes={totalVotes}/>
                    </Fragment>
                );
            });
            return (
                <div style={{display: (props.selectedState !== 'polls' ? 'none' : 'block')}}>
                    <div className='handraise-container'>
                        <div className='central-container'>
                            <h2>{currentPoll.question}</h2>
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
                            width: 80%;
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
        }
    } else {
        return (
            <div style={{display: (props.selectedState !== 'polls' ? 'none' : 'block')}}>
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
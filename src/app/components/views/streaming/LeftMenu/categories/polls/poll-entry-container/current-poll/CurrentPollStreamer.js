import React, {useState, useEffect, Fragment} from 'react';
import {withFirebase} from 'context/firebase';
import PollOptionResultViewer from './PollOptionResultViewer';
import CurrentPollGraph from "../../../../../sharedComponents/CurrentPollGraph";
import {Button} from "@material-ui/core";


function CurrentPollStreamer(props) {
    const [currentPoll, setCurrentPoll] = useState(null)

    useEffect(() => {
        if (props.poll) {
            setCurrentPoll(props.poll)
        }
    }, [props.poll])

    function setPollState(state) {
        props.firebase.setPollState(props.livestream.id, props.poll.id, state);
    }

    let totalVotes = 0;
    props.poll.options.forEach(option => totalVotes += option.votes);

    const optionElements = props.poll.options.map((option, index) => {
        return (
            <Fragment key={index}>
                <PollOptionResultViewer option={option} index={index} totalVotes={totalVotes}/>
            </Fragment>
        );
    });

    return (
        <Fragment>
            <div>
                <div className='chat-entry-container'>
                    <div className='poll-label'>ACTIVE POLL</div>
                    {currentPoll && <CurrentPollGraph background="transparent"
                        currentPoll={currentPoll}/>}
                <Button fullWidth children={'Close Poll'} variant="contained" color="primary" onClick={() => setPollState('closed')}
                        style={{borderRadius: '0 0 5px 5px'}}/>
                </div>
            </div>
            <style jsx>{`
                .chat-entry-container {
                    border-radius: 15px;
                    box-shadow: 0 0 5px rgb(180,180,180);
                    margin: 10px 10px 0 10px;
                    padding-top: 12px;
                    background-color: white;
                    border: 10px solid rgb(0, 210, 170);
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
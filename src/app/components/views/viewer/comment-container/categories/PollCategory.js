import React, {useState, useEffect, Fragment} from 'react';

import { withFirebase } from 'context/firebase';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';
import UserContext from 'context/user/UserContext';

function PollCategory(props) {

    if (props.selectedState !== 'polls') {
        return null;
    }

    const { authenticatedUser, userData } = React.useContext(UserContext);
    const [currentPoll, setCurrentPoll] = useState(null); 

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

    function voteForPollOption(index) {
        props.firebase.voteForPollOption(props.livestream.id, currentPoll.id, authenticatedUser.email, index);
    }

    if (currentPoll) {
        const colors = ['red', 'orange', 'pink', 'olive'];
        let optionElementsLarge = currentPoll.options.map((option, index) => {
            return (
                <Fragment key={index}>
                    <div className='option-container'>
                        <Button content={option.name} color={colors[index]} onClick={() => voteForPollOption(index)} size='small' fluid/>
                    </div>
                    <style jsx>{`
                        .option-container {
                            margin: 10px 10px 0 0;
                        }
    
                        .option-container div {
                            display: inline-block;
                            vertical-align: middle;
                        }
    
                        .option-container-index {
                            position: relative;
                            margin: 0 5px 0 0;
                            padding: 3px;
                            border-radius: 50%;
                            width: 20px;
                            height: 20px;
                            font-size: 0.8em;
                        }
    
                        .option-container-index div {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            color: white;
                        }
    
                        .option-container-name {
                            margin: 0 0 0 5px;
                        }
                    `}</style>
                </Fragment>
            );
        });

        return (
            <div className='animated fadeIn'>
                <div className='handraise-container'>
                    <div className='central-container'>
                        <h2>{ currentPoll.question }</h2>
                        <div>
                            { optionElementsLarge }
                        </div>
                        <p>Please wait for the streamer to activate hand raise and join the stream!.</p>
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
                        font-size: 2em;
                    }

                    .central-container p {
                        margin: 20px 0 30px 0;
                    }
            `}</style>
            </div>
        );
    } else {
        return (
            <div className='animated fadeIn'>
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
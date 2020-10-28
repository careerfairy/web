import React, {useState, useEffect, Fragment} from 'react';

import { withFirebase } from 'context/firebase';
import BarChartIcon from '@material-ui/icons/BarChart';
import AddIcon from '@material-ui/icons/Add';
import PollCreationModal from './polls/poll-creation-modal/PollCreationModal';
import PollEntryContainer from './polls/poll-entry-container/PollEntryContainer';
import {Button} from "@material-ui/core";

function PollCategory(props) {
    
    const [addNewPoll, setAddNewPoll] = useState(false);
    const [pollEntries, setPollEntries] = useState([]);

    useEffect(() => {
        if (props.livestream.id) {
            const unsubscribe = props.firebase.listenToPollEntries(props.livestream.id, querySnapshot => {
                var pollEntries = [];
                querySnapshot.forEach(doc => {
                    let poll = doc.data();
                    poll.id = doc.id;                    
                    pollEntries.push(poll);
                });
                setPollEntries(pollEntries);
            });
            return () => unsubscribe();
        }
    }, [props.livestream.id]);

    const somePollIsCurrent = pollEntries.some( poll => poll.state === 'current');

    const pollElements = pollEntries.filter(poll => poll.state !== 'closed').map((poll, index) => {
        return (
            <Fragment key={index}>
                <PollEntryContainer poll={poll} streamer={props.streamer} user={props.user} userData={props.userData} livestream={props.livestream} somePollIsCurrent={somePollIsCurrent}/>
            </Fragment>
        );
    });

    return (
        <>
            <div className='questionToggle'>
                <div className='questionToggleTitle'>
                    <BarChartIcon fontSize="large" color="primary"/> Polls
                </div>
                <Button style={{marginBottom: "1rem"}} startIcon={<AddIcon/>} children='Create Poll' onClick={() => setAddNewPoll(true)} variant="contained" color="primary"/>
            </div>
            <div className='chat-container'>
                <div className='chat-scrollable'>
                    { pollElements }
                </div>
            </div>  
            <PollCreationModal livestreamId={props.livestream.id} open={addNewPoll} initialPoll={null} initialOptions={null} handleClose={() => setAddNewPoll(false)}/>
            <style jsx>{`
                .questionToggle {
                    background-color: rgb(255,255,255);
                    box-shadow: 0 4px 2px -2px rgb(200,200,200);
                    z-index: 9000;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    align-items: center;
                }
                
                .questionToggle > * {
                  margin: 1rem 0;
                }

                .questionToggleTitle {
                    width: 100%;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    font-size: 1.2em;
                    font-weight: 500;
                    text-align: center;
                }

                .hidden {
                    display: none;
                }

                .chat-container {
                    width: 100%;
                    background-color: rgb(220,220,220);
                }

                .chat-scrollable {
                    width: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 0 0 10px 0;
                }

                .modal-title {
                    font-size: 1.8em;
                    text-align: center;
                    font-weight: 500;
                    color: rgb(80,80,80);
                    margin: 0 0 20px 0;
                }

                .modal-content {
                    width: 60%;
                    margin: 0 auto;
                    padding: 0 0 20px 0;
                }

                .modal-content-question {
                    margin: 20px 0;
                }

                .modal-content-options {
                    margin: 10px 0 20px 0;
                }

                .modal-content-option {
                    margin: 5px 0 10px 0;
                }

                .modal-content .label {
                    font-weight: 700;
                    margin-bottom: 3px;
                    color: rgb(80,80,80);
                }

                .modal-content .label.teal {
                    font-size: 1.3em;
                    color: rgb(0, 210, 170);
                    margin-bottom: 5px;
                }

                ::-webkit-scrollbar {
                    width: 5px;
                }

                ::-webkit-scrollbar-thumb {
                    background-color: rgb(130,130,130);
                }
          `}</style>
        </>
    );
}

export default withFirebase(PollCategory);
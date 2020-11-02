import React, {useState, useEffect, Fragment} from 'react';

import {withFirebase} from 'context/firebase';
import BarChartIcon from '@material-ui/icons/BarChart';
import AddIcon from '@material-ui/icons/Add';
import PollCreationModal from './polls/poll-creation-modal/PollCreationModal';
import PollEntryContainer from './polls/poll-entry-container/PollEntryContainer';
import {Button} from "@material-ui/core";
import {
    CategoryContainerTopAligned,
    QuestionContainerHeader,
    QuestionContainerTitle
} from "../../../../../materialUI/GlobalContainers";

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

    const somePollIsCurrent = pollEntries.some(poll => poll.state === 'current');

    const pollElements = pollEntries.filter(poll => poll.state !== 'closed').map((poll, index) => {
        return (
            <Fragment key={index}>
                <PollEntryContainer poll={poll} streamer={props.streamer} user={props.user} userData={props.userData}
                                    livestream={props.livestream} somePollIsCurrent={somePollIsCurrent}/>
            </Fragment>
        );
    });

    return (
        <CategoryContainerTopAligned>
            <QuestionContainerHeader>
                <QuestionContainerTitle>
                    <BarChartIcon fontSize="large" color="primary"/> Polls
                </QuestionContainerTitle>
                <Button style={{marginBottom: "1rem"}} startIcon={<AddIcon/>} children='Create Poll'
                        onClick={() => setAddNewPoll(true)} variant="contained" color="primary"/>
            </QuestionContainerHeader>
            <div style={{width: "100%"}}>
                {pollElements}
            </div>
            <PollCreationModal livestreamId={props.livestream.id} open={addNewPoll} initialPoll={null}
                               initialOptions={null} handleClose={() => setAddNewPoll(false)}/>
        </CategoryContainerTopAligned>
    );
}

export default withFirebase(PollCategory);
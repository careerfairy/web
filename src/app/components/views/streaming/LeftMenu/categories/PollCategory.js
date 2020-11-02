import React, {useState, useEffect, Fragment} from 'react';
import {withFirebase} from 'context/firebase';
import BarChartIcon from '@material-ui/icons/BarChart';
import AddIcon from '@material-ui/icons/Add';
import PollCreationModal from './polls/poll-creation-modal/PollCreationModal';
import PollEntryContainer from './polls/poll-entry-container/PollEntryContainer';
import {Button, Fab} from "@material-ui/core";
import {
    CategoryContainerTopAligned,
    QuestionContainerHeader,
    QuestionContainerTitle
} from "../../../../../materialUI/GlobalContainers";

function PollCategory({firebase, streamer, livestream, selectedState, setShowMenu, user, userData}) {

    const [addNewPoll, setAddNewPoll] = useState(false);
    const [pollEntries, setPollEntries] = useState([]);

    useEffect(() => {
        if (livestream.id) {
            const unsubscribe = firebase.listenToPollEntries(livestream.id, querySnapshot => {
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
    }, [livestream.id]);

    const somePollIsCurrent = pollEntries.some(poll => poll.state === 'current');

    const pollElements = pollEntries.filter(poll => poll.state !== 'closed').map((poll, index) => {
        return (
            <Fragment key={index}>
                <PollEntryContainer poll={poll} streamer={streamer} user={user} userData={userData}
                                    livestream={livestream} somePollIsCurrent={somePollIsCurrent}/>
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
            <PollCreationModal livestreamId={livestream.id} open={addNewPoll} initialPoll={null}
                               initialOptions={null} handleClose={() => setAddNewPoll(false)}/>
        </CategoryContainerTopAligned>
    );
}

export default withFirebase(PollCategory);
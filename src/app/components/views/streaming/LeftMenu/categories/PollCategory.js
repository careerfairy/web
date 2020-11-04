import React, {useState, useEffect, Fragment, useContext} from 'react';
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
import TutorialContext from "../../../../../context/tutorials/TutorialContext";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "../../../../../materialUI/GlobalTooltips";

function PollCategory({firebase, streamer, livestream, selectedState, showMenu, user, userData, sliding}) {

    const [addNewPoll, setAddNewPoll] = useState(false);
    const [pollEntries, setPollEntries] = useState([]);
    const [demoPolls, setDemoPolls] = useState(false);
    const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);

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
    const getActiveTutorialStepKey = () => {
        const activeStep = Object.keys(tutorialSteps).find((key) => {
            if (tutorialSteps[key]) {
                return key
            }
        })
        return Number(activeStep)
    }


    const pollElements = pollEntries.filter(poll => poll.state !== 'closed').map((poll, index) => {
        return (
            <Fragment key={index}>
                <PollEntryContainer
                    selectedState={selectedState}
                    showMenu={showMenu}
                    poll={poll}
                    sliding={sliding}
                    addNewPoll={addNewPoll}
                    setDemoPolls={setDemoPolls}
                    index={index}
                    streamer={streamer}
                    user={user}
                    demoPolls={demoPolls}
                    userData={userData}
                    livestream={livestream}
                    somePollIsCurrent={somePollIsCurrent}/>
            </Fragment>
        );
    });

    const isOpen = (property) => {
        const activeStep = getActiveTutorialStepKey()
        console.log("-> activeStep", activeStep);
        console.log("-> property", property);
        return Boolean(livestream.test
            && showMenu
            && !addNewPoll
            && tutorialSteps.streamerReady
            && (tutorialSteps[property] || !pollElements.length && activeStep !== 8)
            && selectedState === "polls"
            && !sliding
        )
    }

    const handleConfirm = (property) => {
        setTutorialSteps({
            ...tutorialSteps,
            [property]: false,
            [property + 1]: true,
        })
    }

    return (
        <CategoryContainerTopAligned>
            <QuestionContainerHeader>
                <QuestionContainerTitle>
                    <BarChartIcon fontSize="large" color="primary"/> Polls
                </QuestionContainerTitle>
                <WhiteTooltip
                    placement="right-start"
                    title={
                        <React.Fragment>
                            <TooltipTitle>Polls (1/3)</TooltipTitle>
                            <TooltipText>
                                Your able to create polls here
                                Which can then be asked to the audience.
                            </TooltipText>
                            <TooltipButtonComponent onConfirm={() => {
                                !pollElements.length && setAddNewPoll(true)
                                handleConfirm(4)
                            }} buttonText="Ok"/>
                        </React.Fragment>
                    } open={isOpen(4)}>
                    <Button startIcon={<AddIcon/>} children='Create Poll'
                            onClick={() => {
                                setAddNewPoll(true)
                                isOpen(4) && handleConfirm(4)
                            }} variant="contained" color="primary"/>
                </WhiteTooltip>
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
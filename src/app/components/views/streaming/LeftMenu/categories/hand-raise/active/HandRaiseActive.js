import React, {useContext, useEffect, useState} from 'react';
import {withFirebase} from 'context/firebase';
import HandRaiseElement from './hand-raise-element/HandRaiseElement';
import NotificationsContext from 'context/notifications/NotificationsContext';
import Grow from "@material-ui/core/Grow";
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';

import {Box, Button, Typography} from "@material-ui/core";
import {CategoryContainerCentered, CategoryContainerTopAligned} from "../../../../../../../materialUI/GlobalContainers";
import {ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";
import Paper from "@material-ui/core/Paper";
import TutorialContext from "../../../../../../../context/tutorials/TutorialContext";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "../../../../../../../materialUI/GlobalTooltips";

function HandRaiseActive({firebase, livestream, showMenu, selectedState, sliding}) {

    const {setNewNotification, setNotificationToRemove} = useContext(NotificationsContext);
    const {tutorialSteps, setTutorialSteps, getActiveTutorialStepKey} = useContext(TutorialContext);

    const [hasEntered, setHasEntered] = useState(false);
    const [hasExited, setHasExited] = useState(false);

    useEffect(() => {
        if (livestream) {
            firebase.listenToHandRaises(livestream.id, querySnapshot => {
                var handRaiseList = [];
                querySnapshot.forEach(doc => {
                    let handRaise = doc.data();
                    handRaise.id = doc.id;
                    handRaiseList.push(handRaise);
                });
                setHandRaises(handRaiseList);
            });
        }
    }, [livestream]);

    const activeStep = getActiveTutorialStepKey()

    const isOpen = (property) => {
        return Boolean(livestream.test
            && showMenu
            && tutorialSteps.streamerReady
            && (tutorialSteps[property] || activeStep === 13)
            && selectedState === "hand"
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

    const [handRaises, setHandRaises] = useState([]);


    function setHandRaiseModeInactive() {
        firebase.setHandRaiseMode(livestream.id, false);
    }

    function updateHandRaiseRequest(handRaiseId, state) {
        firebase.updateHandRaiseRequest(livestream.id, handRaiseId, state);
    }

    let handRaiseElements = handRaises.filter(handRaise => (handRaise.state !== 'unrequested' && handRaise.state !== 'denied')).map(handRaise => {
        return (   
                <HandRaiseElement request={handRaise} hasEntered={hasEntered} updateHandRaiseRequest={updateHandRaiseRequest}
                    setNewNotification={setNewNotification}
                    setNotificationToRemove={setNotificationToRemove}/>
        );
    })

    if (!livestream.handRaiseActive) {
        return null;
    }
    return (
        <>
            <Grow timeout={tutorialSteps.streamerReady ? 0 : 'auto'} onEntered={() => setHasEntered(true)} onExited={() => setHasExited(true)} mountOnEnter unmountOnExit in={Boolean(handRaiseElements.length)}>
                <CategoryContainerTopAligned style={{background: "rgb(240,240,240)"}}>
                    {handRaiseElements}
                    <Button style={{margin: "auto 0 2rem 0"}} startIcon={<CloseRoundedIcon/>} variant="contained"
                            children='Deactivate Hand Raise'
                            onClick={() => setHandRaiseModeInactive()}/>
                </CategoryContainerTopAligned>
            </Grow>

            <Grow mountOnEnter unmountOnExit in={Boolean(!handRaiseElements.length)}>
                <CategoryContainerCentered>
                    <Box p={2} component={Paper} style={{width: "90%", display: "grid", placeItems: "center"}}>
                        <PanToolOutlinedIcon color="primary" style={{fontSize: 40}}/>
                        <ThemedPermanentMarker gutterBottom>Waiting for viewers to raise their
                            hands...</ThemedPermanentMarker>
                        <Typography style={{marginBottom: "1rem"}} align="center">Your viewers can now request to join
                            the stream. Don't forget to
                            remind them
                            to join in!</Typography>
                        <WhiteTooltip
                            placement="right-end"
                            title={
                                <React.Fragment>
                                    <TooltipTitle>Hand Raise (2/2)</TooltipTitle>
                                    <TooltipText>
                                        You can de-activate the Hand Raise mode to
                                        prevent viewers from making subsequent requests.
                                    </TooltipText>
                                    {activeStep === 13 && < TooltipButtonComponent onConfirm={() => {
                                        setHandRaiseModeInactive()
                                        handleConfirm(13)
                                    }} buttonText="Ok"/>}
                                </React.Fragment>
                            } open={hasExited && isOpen(13)}>
                            <Button variant="contained" startIcon={<CloseRoundedIcon/>}
                                    children='Deactivate Hand Raise'
                                    onClick={() => {
                                        setHandRaiseModeInactive()
                                        isOpen(13) && activeStep === 13 && handleConfirm(13)
                                    }}/>
                        </WhiteTooltip>
                    </Box>
                </CategoryContainerCentered>
            </Grow>
        </>
    );
}

export default withFirebase(HandRaiseActive);
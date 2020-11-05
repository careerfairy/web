import React, {useContext} from 'react';
import {withFirebase} from 'context/firebase';
import {Button, Typography} from "@material-ui/core";
import {CategoryContainerCentered} from "../../../../../../../materialUI/GlobalContainers";
import {GreyPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";
import Grow from "@material-ui/core/Grow";
import TutorialContext from "../../../../../../../context/tutorials/TutorialContext";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "../../../../../../../materialUI/GlobalTooltips";

function HandRaiseInactive({firebase, livestream, showMenu, selectedState, sliding}) {

    const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);

    const isOpen = (property) => {
        return Boolean(livestream.test
            && showMenu
            && tutorialSteps.streamerReady
            && tutorialSteps[property]
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

    if (livestream.handRaiseActive) {
        return null;
    }

    function setHandRaiseModeActive() {
        firebase.setHandRaiseMode(livestream.id, true);
    }

    return (
        <Grow mountOnEnter unmountOnExit in={Boolean(!livestream.handRaiseActive)}>
            <CategoryContainerCentered>
                <div style={{width: "90%", display: "grid", placeItems: "center"}}>
                    <GreyPermanentMarker>Hand Raise is not active</GreyPermanentMarker>
                    <Typography style={{marginBottom: "1rem"}} align="center" gutterBottom>Allow viewers to join in your
                        stream by activating hand
                        raise.</Typography>
                    <WhiteTooltip
                        placement="right-start"
                        title={
                            <React.Fragment>
                                <TooltipTitle>Hand Raise (1/2)</TooltipTitle>
                                <TooltipText>
                                    Invite your viewers to also ask you
                                    questions via video and audio
                                </TooltipText>
                                <TooltipButtonComponent onConfirm={() => {
                                    setHandRaiseModeActive()
                                    handleConfirm(9)
                                }} buttonText="Ok"/>
                            </React.Fragment>
                        } open={isOpen(9)}>
                        <Button variant="contained" color="primary" size='large'
                                children='Activate Hand Raise'
                                onClick={() => {
                                    setHandRaiseModeActive()
                                    isOpen(9) && handleConfirm(9)
                                }}/>
                    </WhiteTooltip>
                </div>
            </CategoryContainerCentered>
        </Grow>
    );
}

export default withFirebase(HandRaiseInactive);
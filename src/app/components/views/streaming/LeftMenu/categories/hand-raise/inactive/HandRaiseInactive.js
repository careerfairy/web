import React from 'react';
import {withFirebase} from 'context/firebase';
import {Button, Typography} from "@material-ui/core";
import {CategoryContainerCentered} from "../../../../../../../materialUI/GlobalContainers";
import {GreyPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";
import Grow from "@material-ui/core/Grow";

function HandRaiseInactive({firebase, livestream}) {

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
                    <Typography align="center" gutterBottom>Allow viewers to join in your stream by activating hand
                        raise.</Typography>
                    <Button style={{marginTop: "1rem"}} variant="contained" color="primary" size='large'
                            children='Activate Hand Raise'
                            onClick={() => setHandRaiseModeActive()}/>
                </div>
            </CategoryContainerCentered>
        </Grow>
    );
}

export default withFirebase(HandRaiseInactive);
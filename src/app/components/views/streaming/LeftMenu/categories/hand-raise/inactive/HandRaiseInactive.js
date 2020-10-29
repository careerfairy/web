import React from 'react';
import {withFirebase} from 'context/firebase';
import {Button, Typography} from "@material-ui/core";
import {CategoryContainerCentered} from "../../../../../../../materialUI/GlobalContainers";
import {GreyPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";

function HandRaiseInactive(props) {

    if (props.livestream.handRaiseActive) {
        return null;
    }

    function setHandRaiseModeActive() {
        props.firebase.setHandRaiseMode(props.livestream.id, true);
    }

    return (
        <CategoryContainerCentered>
            <div style={{width: "90%", display: "grid", placeItems: "center"}}>
                <GreyPermanentMarker>Hand Raise is not active</GreyPermanentMarker>
                <Typography align="center" gutterBottom>Allow viewers to join in your stream by activating hand raise.</Typography>
                <Button style={{marginTop: "1rem"}} variant="contained" color="primary" size='large' children='Activate Hand Raise'
                        onClick={() => setHandRaiseModeActive()}/>
            </div>
        </CategoryContainerCentered>
    );
}

export default withFirebase(HandRaiseInactive);
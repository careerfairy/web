import React from 'react';
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import {Button} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";
import {CategoryContainerCentered, CategoryContainerContent} from "../../../../../../../materialUI/GlobalContainers";
import {ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";

function HandRaiseRequested(props) {

    return (
        <Grow unmountOnExit in={Boolean(!(!props.handRaiseState || props.handRaiseState.state !== 'connected'))}>
            <CategoryContainerCentered>
                <CategoryContainerContent>
                    <ThemedPermanentMarker align="center">You are live!</ThemedPermanentMarker>
                    <Button size='large' startIcon={<ClearRoundedIcon/>} variant="contained"
                            children='Stop Streaming' onClick={() => props.updateHandRaiseRequest("unrequested")}/>
                </CategoryContainerContent>
            </CategoryContainerCentered>
        </Grow>
    );
}

export default HandRaiseRequested;
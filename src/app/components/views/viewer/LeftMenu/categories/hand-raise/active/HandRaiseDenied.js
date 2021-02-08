import React from 'react';
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import {Button} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";
import {CategoryContainerCentered, CategoryContainerContent} from "../../../../../../../materialUI/GlobalContainers";
import {ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";

function HandRaiseRequested(props) {

    return (
        <Grow unmountOnExit in={!(!props.handRaiseState || (props.handRaiseState.state !== 'denied'))}>
            <CategoryContainerCentered>
                <CategoryContainerContent>
                    <ThemedPermanentMarker>Sorry we can't answer your question right now.</ThemedPermanentMarker>
                    <Button size='large' startIcon={<ClearRoundedIcon/>} variant="contained" children='Cancel'
                            onClick={() => props.updateHandRaiseRequest("unrequested")}/>
                </CategoryContainerContent>
            </CategoryContainerCentered>
        </Grow>
    );
}

export default HandRaiseRequested;
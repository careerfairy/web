import React from 'react';
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import { Button, Grow } from "@material-ui/core";
import {CategoryContainerCentered, CategoryContainerContent} from "../../../../../../../materialUI/GlobalContainers";
import {ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";

function HandRaiseRequested(props) {
    const shouldRender = () => Boolean(!(!props.handRaiseState || props.handRaiseState.state !== 'connected'))
    return shouldRender() && (
        <Grow unmountOnExit in>
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
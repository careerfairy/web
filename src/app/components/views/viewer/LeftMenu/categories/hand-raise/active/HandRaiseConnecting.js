import React from 'react';
import {Button} from "@material-ui/core";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import Grow from "@material-ui/core/Grow";
import {CategoryContainerCentered, CategoryContainerContent} from "../../../../../../../materialUI/GlobalContainers";
import {ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";

function HandRaiseRequested(props) {
    const shouldRender = () => Boolean(!(!props.handRaiseState || (props.handRaiseState.state !== 'connecting' && props.handRaiseState.state !== 'invited')))
    return shouldRender() && (
        <Grow unmountOnExit in>
            <CategoryContainerCentered>
                <CategoryContainerContent>
                    <ThemedPermanentMarker>Connecting to the stream...</ThemedPermanentMarker>
                    <Button size='large' startIcon={<ClearRoundedIcon/>} variant="contained" children='Cancel'
                            onClick={() => props.updateHandRaiseRequest("unrequested")}/>
                </CategoryContainerContent>
            </CategoryContainerCentered>
        </Grow>
    );
}

export default HandRaiseRequested;
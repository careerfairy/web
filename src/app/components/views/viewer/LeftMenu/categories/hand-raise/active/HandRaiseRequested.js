import React from 'react';
import {Button} from "@material-ui/core";
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import Grow from "@material-ui/core/Grow";
import {CategoryContainerCentered, CategoryContainerContent} from "../../../../../../../materialUI/GlobalContainers";
import {CategorySubtitle, ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";

function HandRaiseRequested(props) {
    return (
        <Grow unmountOnExit in={Boolean(!(!props.handRaiseState || props.handRaiseState.state !== 'requested'))}>
            <CategoryContainerCentered>
                <CategoryContainerContent>
                    <ThemedPermanentMarker>You raised your&nbsp;hand!</ThemedPermanentMarker>
                    <CategorySubtitle>Please wait to be invited to join by
                        the&nbsp;speaker.</CategorySubtitle>
                    <Button size='large' startIcon={<ClearRoundedIcon/>} variant="contained" children='Cancel'
                            onClick={() => props.updateHandRaiseRequest("unrequested")}/>
                </CategoryContainerContent>
            </CategoryContainerCentered>
        </Grow>
    );
}

export default HandRaiseRequested;
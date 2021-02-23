import React from 'react';
import { Button, Grow } from "@material-ui/core";
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import {CategoryContainerCentered, CategoryContainerContent} from "../../../../../../../materialUI/GlobalContainers";
import {CategorySubtitle, ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";

function HandRaiseRequested({handRaiseState, updateHandRaiseRequest}) {
    const shouldRender = () => Boolean(!(!handRaiseState || handRaiseState.state !== 'requested'))
    return shouldRender() && (
        <Grow unmountOnExit in>
            <CategoryContainerCentered>
                <CategoryContainerContent>
                    <ThemedPermanentMarker>You raised your&nbsp;hand!</ThemedPermanentMarker>
                    <CategorySubtitle>Please wait to be invited to join by
                        the&nbsp;speaker.</CategorySubtitle>
                    <Button size='large' startIcon={<ClearRoundedIcon/>} variant="contained" children='Cancel'
                            onClick={() => updateHandRaiseRequest("unrequested")}/>
                </CategoryContainerContent>
            </CategoryContainerCentered>
        </Grow>
    );
}

export default HandRaiseRequested;
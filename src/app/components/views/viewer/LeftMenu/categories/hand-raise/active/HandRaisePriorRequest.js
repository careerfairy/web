import React from 'react';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import {Button} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";
import {CategoryContainerCentered, CategoryContainerContent} from "../../../../../../../materialUI/GlobalContainers";
import {CategorySubtitle, ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";

function HandRaisePriorRequest({ handRaiseState, updateHandRaiseRequest}) {
    const shouldRender = () => Boolean(!(handRaiseState && handRaiseState.state !== 'unrequested'))
    return shouldRender() &&(
        <Grow unmountOnExit in>
            <CategoryContainerCentered>
                <CategoryContainerContent>
                    <div className='animated bounce infinite slow'>
                        <PanToolOutlinedIcon color="primary" style={{fontSize: 40}}/>
                    </div>
                    <ThemedPermanentMarker>Raise your hand and join the stream!</ThemedPermanentMarker>
                    <CategorySubtitle>By raising your hand, you can request to join the stream with your computer's
                        audio
                        and video
                        and ask your questions face-to-face.</CategorySubtitle>
                    <Button variant="contained" size='large' startIcon={<PanToolOutlinedIcon fontSize="large"/>}
                            children='Raise my hand' onClick={() => updateHandRaiseRequest("requested")}
                            color="primary"/>
                </CategoryContainerContent>

            </CategoryContainerCentered>
        </Grow>
    );
}

export default HandRaisePriorRequest;
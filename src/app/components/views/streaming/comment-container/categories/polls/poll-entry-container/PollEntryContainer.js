import React from 'react';
import UpcomingPollStreamer from './upcoming-poll/UpcomingPollStreamer';
import UpcomingPollViewer from './upcoming-poll/UpcomingPollViewer';
import CurrentPollStreamer from './current-poll/CurrentPollStreamer';
import CurrentPollViewer from './current-poll/CurrentPollViewer';

function PollEntryContainer(props) {
    if ( props.poll.state === 'upcoming' && props.streamer === true) {
        return(
            <UpcomingPollStreamer {...props}/>
        );
    }
    if ( props.poll.state === 'upcoming' && props.streamer === false) {
        return(
            <UpcomingPollViewer {...props}/>  
        );
    }
    if ( props.poll.state === 'current' && props.streamer === true) {
        return(
            <CurrentPollStreamer {...props}/>
        );
    }
    if ( props.poll.state === 'current' && props.streamer === false) {
        return(
            <CurrentPollViewer {...props}/>
        );
    }
}

export default PollEntryContainer;
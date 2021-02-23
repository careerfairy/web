import React from 'react';
import StreamerOverview from "../../../components/views/streaming";
import StreamerLayout from "../../../layouts/StreamerLayout";


const StreamerPage = ({notifications, setNumberOfViewers, streamerId, showMenu}) => {

    return (
        <StreamerLayout>
            <StreamerOverview
                notifications={notifications}
                showMenu={showMenu}
                setNumberOfViewers={setNumberOfViewers}
                streamerId={streamerId}
                isStreamer
                isMainStreamer
            />
        </StreamerLayout>
    )
}


export default StreamerPage

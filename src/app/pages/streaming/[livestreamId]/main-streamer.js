import React from 'react';
import StreamerOverview from "../../../components/views/streaming";
import StreamerLayout from "../../../layouts/StreamerLayout";


const StreamerPage = ({notifications, setNumberOfViewers}) => {

    return (
        <StreamerLayout>
            <StreamerOverview
                notifications={notifications}
                setNumberOfViewers={setNumberOfViewers}
                isStreamer
                isMainStreamer
            />
        </StreamerLayout>
    )
}


export default StreamerPage

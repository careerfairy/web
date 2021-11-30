import React, {useContext} from 'react';

const CurrentStreamContext = React.createContext({
    currentLivestream: false,
    isBreakout: false,
    isStreamer: false,
    isMainStreamer: false,
    streamerId: ""
});

const useCurrentStream = () => useContext(CurrentStreamContext);

export {CurrentStreamContext, useCurrentStream}
import React, {useContext} from 'react';

const CurrentStreamContext = React.createContext({currentLivestream: false});

const useCurrentStream = () => useContext(CurrentStreamContext);

export {CurrentStreamContext, useCurrentStream}
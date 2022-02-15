import React, { useContext } from "react";

const CurrentStreamContext = React.createContext({
   currentLivestream: null,
   isBreakout: false,
   isStreamer: false,
   isMainStreamer: false,
   streamerId: "",
});

const useCurrentStream = () => useContext(CurrentStreamContext);

export { CurrentStreamContext, useCurrentStream };

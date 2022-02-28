import React, { useContext } from "react";

const CurrentStreamContext = React.createContext({
   currentLivestream: false,
   isBreakout: false,
   isStreamer: false,
   isMainStreamer: false,
   streamerId: "",
   streamAdminPreferences: undefined,
});

const useCurrentStream = () => useContext(CurrentStreamContext);

export { CurrentStreamContext, useCurrentStream };

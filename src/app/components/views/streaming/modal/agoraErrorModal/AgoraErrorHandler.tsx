import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import RootState from "store/reducers";
import FailedToSubscribeWithProxy from "./ModalViews/FailedToSubscribeWithProxy";
import * as actions from "store/actions";
import { RTCError } from "types";
import FailedToSubscribeWithoutProxy from "./ModalViews/FailedToSubscribeWithoutProxy";

interface Props {
   handleEnableCloudProxy: (strictMode?: boolean) => Promise<any>;
}
const AgoraErrorHandler: FC<Props> = (props) => {
   const dispatch = useDispatch();
   const agoraRtcError = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcError;
   });

   const handleEnableProxy = async (strictMode?: boolean) => {
      try {
         await props.handleEnableCloudProxy(strictMode);
         dispatch(actions.clearAgoraRtcError());
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
   };

   function getErrorModal(code: RTCError["code"]) {
      switch (code) {
         case "FAILED_TO_SUBSCRIBE_WITH_PROXY":
            return (
               <FailedToSubscribeWithProxy
                  handleEnableProxy={handleEnableProxy}
               />
            );
         case "FAILED_TO_SUBSCRIBE_WITHOUT_PROXY":
            return (
               <FailedToSubscribeWithoutProxy
                  handleEnableProxy={handleEnableProxy}
               />
            );
         default:
            return null;
      }
   }

   // return <FailedToSubscribeWithProxy handleEnableProxy={handleEnableProxy} />;

   return <>{getErrorModal(agoraRtcError?.code)}</>;
};

export default AgoraErrorHandler;

import PropsContext, {
   PropsInterface,
   PropsProvider,
} from "../../context/agora/PropsContext"
import React, { useContext } from "react"
import RtcConfigure from "../../context/agora/RTCProvider"

/**
 * High level component to render the UI Kit
 * @param props {@link PropsInterface}
 */
const UserInterface: React.FC<PropsInterface> = (props) => {
   return (
      <PropsProvider value={props}>
         <VideoCallUI>{props.children}</VideoCallUI>
      </PropsProvider>
   )
}

export const VideoCallUI: React.FC = (props) => {
   const { rtcProps } = useContext(PropsContext)
   return (
      <RtcConfigure callActive={rtcProps.callActive}>
         {props.children}
      </RtcConfigure>
   )
}

export default UserInterface

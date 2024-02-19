import React, {
   createContext,
   useContext,
   ReactNode,
   useMemo,
   useCallback,
} from "react"
import { useLocalTracks, useStreamingContext } from "../../context"
import { useLocalCameraTrack, useLocalMicrophoneTrack } from "agora-rtc-react"
import { useTrackHandler } from "components/custom-hook/streaming/useTrackHandler"

type SettingsMenuContextType = {
   tempCameraTrack: ReturnType<typeof useLocalCameraTrack>
   tempMicrophoneTrack: ReturnType<typeof useLocalMicrophoneTrack>
   tempCameraId: string
   tempMicrophoneId: string
   setTempCameraId: (id: string) => void
   setTempMicrophoneId: (id: string) => void
   handleSaveAndClose: () => void
   handleClose: () => void
}

const SettingsMenuContext = createContext<SettingsMenuContextType | undefined>(
   undefined
)

type SettingsMenuProviderProps = {
   children: ReactNode
   onClose: () => void
}

export const SettingsMenuProvider = ({
   children,
   onClose,
}: SettingsMenuProviderProps) => {
   const {
      activeCameraId: initialCameraId,
      activeMicrophoneId: initialMicrophoneId,
      setActiveCameraId,
      setActiveMicrophoneId,
   } = useLocalTracks()

   const { shouldStream } = useStreamingContext()

   const tempCameraTrack = useLocalCameraTrack(shouldStream, {
      cameraId: initialCameraId,
   })
   const tempMicrophoneTrack = useLocalMicrophoneTrack(shouldStream, {
      microphoneId: initialMicrophoneId,
   })

   const {
      activeDeviceId: tempMicrophoneId,
      handleSetActiveDevice: setTempMicrophoneId,
   } = useTrackHandler("microphone", tempMicrophoneTrack.localMicrophoneTrack)

   const {
      activeDeviceId: tempCameraId,
      handleSetActiveDevice: setTempCameraId,
   } = useTrackHandler("camera", tempCameraTrack.localCameraTrack)

   const handleSaveAndClose = useCallback(() => {
      setActiveCameraId(tempCameraId)
      setActiveMicrophoneId(tempMicrophoneId)
      onClose()
   }, [
      onClose,
      setActiveCameraId,
      setActiveMicrophoneId,
      tempCameraId,
      tempMicrophoneId,
   ])

   const value = useMemo<SettingsMenuContextType>(
      () => ({
         tempCameraTrack,
         tempMicrophoneTrack,
         tempCameraId,
         tempMicrophoneId,
         setTempCameraId,
         setTempMicrophoneId,
         handleSaveAndClose,
         handleClose: onClose,
      }),
      [
         tempCameraTrack,
         tempMicrophoneTrack,
         tempCameraId,
         tempMicrophoneId,
         setTempCameraId,
         setTempMicrophoneId,
         handleSaveAndClose,
         onClose,
      ]
   )

   return (
      <SettingsMenuContext.Provider value={value}>
         {children}
      </SettingsMenuContext.Provider>
   )
}

export const useSettingsMenu = () => {
   const context = useContext(SettingsMenuContext)
   if (context === undefined) {
      throw new Error(
         "useSettingsMenu must be used within a SettingsMenuProvider"
      )
   }
   return context
}

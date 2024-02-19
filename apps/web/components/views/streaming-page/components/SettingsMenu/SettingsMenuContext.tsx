import React, {
   createContext,
   useContext,
   ReactNode,
   useState,
   useMemo,
   useCallback,
} from "react"
import { useLocalTracks, useStreamingContext } from "../../context"
import { useLocalCameraTrack, useLocalMicrophoneTrack } from "agora-rtc-react"
import { useSetDevice } from "components/custom-hook/streaming/useSetDevice"

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

   const [tempMicrophoneId, setTempMicrophoneId] = useState(initialMicrophoneId)
   const [tempCameraId, setTempCameraId] = useState(initialCameraId)

   const { shouldStream } = useStreamingContext()

   const tempCameraTrack = useLocalCameraTrack(shouldStream, {
      cameraId: tempCameraId,
   })
   const tempMicrophoneTrack = useLocalMicrophoneTrack(shouldStream, {
      microphoneId: tempMicrophoneId,
   })

   useSetDevice(tempCameraTrack.localCameraTrack, tempCameraId)
   useSetDevice(tempMicrophoneTrack.localMicrophoneTrack, tempMicrophoneId)

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
         handleSaveAndClose,
         tempMicrophoneTrack,
         onClose,
         tempCameraId,
         tempMicrophoneId,
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

import { useAppDispatch, useAppSelector } from "hooks"
import {
   createContext,
   useContext,
   ReactNode,
   useMemo,
   useCallback,
   useEffect,
   FC,
   useState,
} from "react"
import { setActiveView, sidePanelSelector } from "store/streamingAppSlice"

type StreamContextProps = {
   livestreamId: string
   isHost: boolean
   // for demo purposes
   toggleIsStreaming: () => void
   // for demo purposes
   isStreaming: boolean
}

type StreamProviderProps = {
   children: ReactNode
   livestreamId: string
   isHost: boolean
}

const StreamContext = createContext<StreamContextProps | undefined>(undefined)

export const StreamProvider: FC<StreamProviderProps> = ({
   livestreamId,
   isHost,
   children,
}) => {
   const { activeView } = useAppSelector(sidePanelSelector)

   const dispatch = useAppDispatch()

   const handRaiseActive = activeView === "hand-raise"

   useEffect(() => {
      // if the user is not a host and the hand raise panel is active,
      // switch to chat
      if (!isHost && handRaiseActive) {
         dispatch(setActiveView("chat"))
      }
   }, [isHost, handRaiseActive, dispatch])

   // for demo purposes
   const [isStreaming, setIsStreaming] = useState<boolean>(isHost)

   // for demo purposes
   const toggleIsStreaming = useCallback(() => {
      if (isHost && !isStreaming) {
         setIsStreaming(true)
         return
      }

      setIsStreaming(!isStreaming)
   }, [isHost, isStreaming])

   const value = useMemo<StreamContextProps>(
      () => ({
         livestreamId,
         isHost,
         toggleIsStreaming,
         isStreaming: isHost ? true : isStreaming,
      }),
      [livestreamId, isHost, toggleIsStreaming, isStreaming]
   )

   return (
      <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
   )
}

export const useStreamContext = () => {
   const context = useContext(StreamContext)
   if (context === undefined) {
      throw new Error("useStreamContext must be used within a StreamProvider")
   }
   return context
}

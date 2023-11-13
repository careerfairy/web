import React, {
   createContext,
   useContext,
   ReactNode,
   useMemo,
   useCallback,
} from "react"

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

export const StreamProvider: React.FC<StreamProviderProps> = ({
   livestreamId,
   isHost,
   children,
}) => {
   // for demo purposes
   const [isStreaming, setIsStreaming] = React.useState<boolean>(isHost)

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

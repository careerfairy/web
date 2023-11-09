import React, { createContext, useContext, ReactNode, useMemo } from "react"

type StreamContextProps = {
   livestreamId: string
   isHost: boolean
}

type StreamProviderProps = StreamContextProps & {
   children: ReactNode
}

const StreamContext = createContext<StreamContextProps | undefined>(undefined)

export const StreamProvider: React.FC<StreamProviderProps> = ({
   livestreamId,
   isHost,
   children,
}) => {
   const value = useMemo(
      () => ({ livestreamId, isHost }),
      [livestreamId, isHost]
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

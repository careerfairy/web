import { UserStream } from "components/views/streaming-page/types"
import { ReactNode, createContext, useContext, useMemo, useState } from "react"

type SpotlightContextValue = {
   stream: UserStream | null
   // Add video-specific state
   showMute?: boolean
   isMuted?: boolean
   handleToggleMute?: () => void
   setShowMute?: (showMute: boolean) => void
   setIsMuted?: (isMuted: boolean) => void
}

const SpotlightContext = createContext<SpotlightContextValue | undefined>(null)

type Props = {
   stream: UserStream | null
   // TODO: Add pdfUrl and youtubeVideoUrl to context when building those features
   children: ReactNode
}

export const SpotlightProvider = ({ stream, children }: Props) => {
   const [isMuted, setIsMuted] = useState(false)
   const [showMute, setShowMute] = useState(false)

   const handleToggleMute = () => {
      setIsMuted((prev) => !prev)
   }

   const contextValue = useMemo<SpotlightContextValue>(
      () => ({
         stream,
         isMuted,
         setIsMuted,
         handleToggleMute,
         showMute,
         setShowMute,
      }),
      [stream, isMuted, showMute]
   )

   return (
      <SpotlightContext.Provider value={contextValue}>
         {children}
      </SpotlightContext.Provider>
   )
}

/**
 * Provides the shared context for all the content that is displayed in the spotlight.
 * This context includes the current stream if there is one, the pdf url, and the youtube video url.
 *
 * @returns The Spotlight context with the current stream.
 */
export const useSpotlight = () => {
   const context = useContext(SpotlightContext)
   if (!context) {
      throw new Error("useSpotlight must be used within a SpotlightProvider")
   }
   return context
}

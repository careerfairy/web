import { UserStream } from "components/views/streaming-page/types"
import { ReactNode, createContext, useContext, useMemo } from "react"

type SpotlightContextValue = {
   stream: UserStream
}

const SpotlightContext = createContext<SpotlightContextValue | undefined>(null)

type Props = {
   stream: UserStream | null
   // TODO: Add pdfUrl and youtubeVideoUrl to context when building those features
   children: ReactNode
}

export const SpotlightProvider = ({ stream, children }: Props) => {
   const contextValue = useMemo<SpotlightContextValue>(
      () => ({ stream }),
      [stream]
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

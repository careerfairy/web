import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import ReactPlayer from "react-player"
import * as yup from "yup"
import { recordingFormValidationSchema } from "../validationSchemas"

export type RecordingFormValues = yup.InferType<
   typeof recordingFormValidationSchema
>

type RecordingFormContextType = {
   livestream: LivestreamEvent
   seekToAndPlay: (seconds: number) => void
   playerRef: React.RefObject<ReactPlayer>
   setIsPlaying: (playing: boolean) => void
   isPlaying: boolean
}

const RecordingFormContext = createContext<
   RecordingFormContextType | undefined
>(undefined)

type RecordingFormProviderProps = {
   children: ReactNode
   livestream: LivestreamEvent
}

export const RecordingFormProvider = ({
   children,
   livestream,
}: RecordingFormProviderProps) => {
   const methods = useYupForm({
      schema: recordingFormValidationSchema,
      mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: getInitialValues(livestream),
   })

   const playerRef = useRef<ReactPlayer>(null)
   const [isPlaying, setIsPlaying] = useState(false)

   useEffect(() => {
      methods.reset(getInitialValues(livestream))
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [livestream])

   const seekToAndPlay = useCallback(
      (seconds: number) => {
         if (playerRef.current && setIsPlaying) {
            playerRef.current.seekTo(seconds, "seconds")
            setIsPlaying(true)
         }
      },
      [setIsPlaying]
   )

   const contextValue = useMemo(
      () => ({
         livestream,
         seekToAndPlay,
         playerRef,
         setIsPlaying,
         isPlaying,
      }),
      [livestream, seekToAndPlay, setIsPlaying, isPlaying]
   )

   return (
      <RecordingFormContext.Provider value={contextValue}>
         <FormProvider {...methods}>{children}</FormProvider>
      </RecordingFormContext.Provider>
   )
}

const getInitialValues = (livestream: LivestreamEvent): RecordingFormValues => {
   return {
      title: livestream?.title ?? "",
      summary: livestream?.summary ?? "",
      backgroundImageUrl: livestream?.backgroundImageUrl ?? "",
      contentTopics: livestream?.contentTopicsTagIds ?? [],
      businessFunctions: livestream?.businessFunctionsTagIds ?? [],
   }
}

export const useRecordingForm = () => useFormContext<RecordingFormValues>()

export const useRecordingFormContext = () => {
   const context = useContext(RecordingFormContext)

   if (!context) {
      throw new Error(
         "useRecordingFormContext must be used within a RecordingFormProvider"
      )
   }

   return context
}

export default RecordingFormProvider

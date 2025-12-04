import { LivestreamChapter } from "@careerfairy/shared-lib/livestreams"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import { useRecordingTokenSWR } from "components/custom-hook/recordings/useRecordingTokenSWR"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { livestreamService } from "data/firebase/LivestreamService"
import { useGroup } from "layouts/GroupDashboardLayout"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { useRecordingFormContext } from "../RecordingFormProvider"
import { ChapterFormValues } from "./ChaptersForm"

type FormState =
   | {
        type: "idle"
     }
   | {
        type: "create"
        defaultValues: ChapterFormValues
     }
   | {
        type: "edit"
        chapter: LivestreamChapter
        defaultValues: ChapterFormValues
     }

type ChaptersFormContextValue = {
   formType: FormState["type"]
   editingChapterId: string | null
   defaultValues?: ChapterFormValues
   isSaving: boolean
   isFormOpen: boolean
   recordingUrl: string | undefined
   openCreateForm: () => void
   openEditForm: (chapter: LivestreamChapter) => void
   cancelForm: () => void
   handleSave: (values: ChapterFormValues) => Promise<void>
}

const ChaptersFormContext = createContext<ChaptersFormContextValue | undefined>(
   undefined
)

type ChaptersFormProviderProps = {
   children: ReactNode
}

export const ChaptersFormProvider = ({
   children,
}: ChaptersFormProviderProps) => {
   const { livestream, getCurrentTime } = useRecordingFormContext()
   const { group } = useGroup()
   const groupId = group?.id
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const [formState, setFormState] = useState<FormState>({ type: "idle" })
   const [isSaving, setIsSaving] = useState(false)
   const { data: recordingToken } = useRecordingTokenSWR(livestream?.id)

   const recordingUrl = useMemo(
      () =>
         recordingToken && livestream?.start
            ? downloadLinkWithDate(
                 livestream.start.toDate(),
                 livestream.id,
                 recordingToken.sid
              )
            : undefined,
      [recordingToken, livestream?.start, livestream?.id]
   )

   const openCreateForm = useCallback(() => {
      setFormState({
         type: "create",
         defaultValues: {
            title: "",
            startSec: Math.max(0, Math.round(getCurrentTime())),
         },
      })
   }, [getCurrentTime])

   const openEditForm = useCallback((chapter: LivestreamChapter) => {
      setFormState({
         type: "edit",
         chapter,
         defaultValues: {
            title: chapter.title ?? "",
            startSec: Math.max(0, Math.round(chapter.startSec ?? 0)),
         },
      })
   }, [])

   const cancelForm = useCallback(() => {
      setFormState({ type: "idle" })
   }, [])

   const handleSave = useCallback(
      async (values: ChapterFormValues) => {
         const livestreamId = livestream?.id

         if (!groupId || !livestreamId || formState.type === "idle") {
            errorNotification(
               "missing-livestream-info",
               "Missing livestream information, please try again."
            )
            return
         }

         setIsSaving(true)
         try {
            if (formState.type === "edit") {
               await livestreamService.updateChapter({
                  livestreamId,
                  groupId,
                  chapterId: formState.chapter.id,
                  title: values.title,
                  startSec: values.startSec,
               })
               successNotification("Chapter updated successfully")
            } else if (formState.type === "create") {
               await livestreamService.createChapter({
                  livestreamId,
                  groupId,
                  title: values.title,
                  startSec: values.startSec,
               })
               successNotification("Chapter created successfully")
            }

            setFormState({ type: "idle" })
         } catch (error) {
            errorNotification(
               error,
               `Failed to ${
                  formState.type === "edit" ? "update" : "create"
               } chapter, please try again.`
            )
         } finally {
            setIsSaving(false)
         }
      },
      [errorNotification, formState, groupId, livestream, successNotification]
   )

   const contextValue = useMemo<ChaptersFormContextValue>(
      () => ({
         formType: formState.type,
         editingChapterId:
            formState.type === "edit" ? formState.chapter.id : null,
         defaultValues:
            formState.type === "idle" ? undefined : formState.defaultValues,
         isSaving,
         isFormOpen: formState.type !== "idle",
         recordingUrl,
         openCreateForm,
         openEditForm,
         cancelForm,
         handleSave,
      }),
      [
         cancelForm,
         formState,
         handleSave,
         isSaving,
         openCreateForm,
         openEditForm,
         recordingUrl,
      ]
   )

   return (
      <ChaptersFormContext.Provider value={contextValue}>
         {children}
      </ChaptersFormContext.Provider>
   )
}

export const useChaptersFormContext = () => {
   const context = useContext(ChaptersFormContext)

   if (!context) {
      throw new Error(
         "useChaptersFormContext must be used within a ChaptersFormProvider"
      )
   }

   return context
}

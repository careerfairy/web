import { yupResolver } from "@hookform/resolvers/yup"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { Timestamp } from "firebase/firestore"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { jobsFormSelectedJobIdSelector } from "store/selectors/adminJobsSelectors"
import { v4 as uuidv4 } from "uuid"

import { StudyBackground } from "@careerfairy/shared-lib/users"
import {
   StudyBackgroundFormValues,
   studyBackgroundSchema,
} from "./createStudyBackground/schemas"

type Props = {
   studyBackground: StudyBackground
   children: ReactNode
   afterCreateStudyBackground?: (studyBackground: StudyBackground) => void
   afterUpdateStudyBackground?: (studyBackground: StudyBackground) => void
}

type StudyBackgroundFormContextType = {
   handleSubmit: (values: StudyBackgroundFormValues) => Promise<void>
   isSubmitting: boolean
}

const StudyBackgroundFormContext =
   createContext<StudyBackgroundFormContextType>({
      handleSubmit: () => null,
      isSubmitting: false,
   })

export const getInitialValues = (
   studyBackground: StudyBackground
): StudyBackgroundFormValues => {
   if (studyBackground) {
      return {
         ...studyBackground,
         startedAt: studyBackground.startedAt?.toDate(),
         endedAt: studyBackground.endedAt?.toDate(),
      }
   }

   return {
      id: uuidv4(),
      school: "",
      fieldOfStudy: null,
      levelOfStudy: null,
      startedAt: null,
      endedAt: null,
   }
}

const StudyBackgroundFormProvider = ({
   studyBackground,
   children,
   afterCreateStudyBackground,
   afterUpdateStudyBackground,
}: Props) => {
   const selectedStudyBackgroundId = useSelector(jobsFormSelectedJobIdSelector)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const [isSubmitting, setIsSubmitting] = useState(false)

   const handleSubmit = useCallback(
      async (values: StudyBackgroundFormValues) => {
         try {
            setIsSubmitting(true)

            const {
               id,
               school,
               levelOfStudy,
               fieldOfStudy,
               startedAt,
               endedAt,
            } = values

            const formattedStudyBackground: StudyBackground = {
               id: id,
               school: school,
               levelOfStudy: levelOfStudy,
               fieldOfStudy: fieldOfStudy,
               startedAt: startedAt ? Timestamp.fromDate(startedAt) : null,
               endedAt: endedAt ? Timestamp.fromDate(endedAt) : null,
            }

            if (selectedStudyBackgroundId) {
               const updatedStudyBackground: StudyBackground = {
                  ...studyBackground,
                  ...formattedStudyBackground,
               }

               // await customJobRepo.updateCustomJob(updatedStudyBackground)
               // TODO: Update study background
               afterUpdateStudyBackground &&
                  afterUpdateStudyBackground(updatedStudyBackground)

               successNotification("Study background successfully updated")
            } else {
               // const createdJob = await customJobRepo.createCustomJob(
               //     formattedJob
               // )
               // TODO: create study background
               const createdStudyBackground: StudyBackground = null
               afterCreateStudyBackground &&
                  afterCreateStudyBackground(createdStudyBackground)

               successNotification("Study background successfully created")
            }
         } catch (error) {
            errorNotification(error, "An error has occurred")
         } finally {
            setIsSubmitting(false)
         }
      },
      [
         selectedStudyBackgroundId,
         studyBackground,
         afterUpdateStudyBackground,
         successNotification,
         afterCreateStudyBackground,
         errorNotification,
      ]
   )

   const contextValue = useMemo(
      () => ({ handleSubmit, isSubmitting }),
      [handleSubmit, isSubmitting]
   )

   const formMethods = useForm<StudyBackgroundFormValues>({
      resolver: yupResolver(studyBackgroundSchema),
      defaultValues: getInitialValues(studyBackground),
      mode: "onChange",
   })

   return (
      <StudyBackgroundFormContext.Provider value={contextValue}>
         <FormProvider {...formMethods}>
            <form>{children}</form>
         </FormProvider>
      </StudyBackgroundFormContext.Provider>
   )
}

const useStudyBackgroundForm = () =>
   useContext<StudyBackgroundFormContextType>(StudyBackgroundFormContext)

export {
   StudyBackgroundFormProvider,
   useStudyBackgroundForm as useCustomJobForm,
}

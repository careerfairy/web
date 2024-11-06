import { StudyBackground } from "@careerfairy/shared-lib/users"
import { StudyBackgroundFormValues } from "./hooks/useStudyBackgroundFormSubmit"

export const getInitialValues = (
   studyBackground?: StudyBackground
): StudyBackgroundFormValues => ({
   id: studyBackground?.id || "",
   universityId: studyBackground?.universityId || "",
   fieldOfStudy: studyBackground?.fieldOfStudy || null,
   levelOfStudy: studyBackground?.levelOfStudy || null,
   startedAt: studyBackground?.startedAt?.toDate() || null,
   endedAt: studyBackground?.endedAt?.toDate() || null,
})

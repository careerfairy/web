import { Group, pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
import { AuthorInfo } from "@careerfairy/shared-lib/livestreams"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import FirebaseService from "data/firebase/FirebaseService"
import { Formik } from "formik"
import { ReactNode } from "react"
import { OfflineEventFormValues } from "./types"
import { offlineEventFormValidationSchema } from "./validationSchemas"

const formGeneralTabInitialValues: OfflineEventFormValues["general"] = {
   title: "",
   description: "",
   address: null,
   targetAudience: {
      universities: [],
      levelOfStudies: [],
      fieldOfStudies: [],
   },
   registrationUrl: "",
   startAt: null,
   backgroundImageUrl: "",
   hidden: false,
}

export const getFormInitialValues = (): OfflineEventFormValues => {
   return {
      general: { ...formGeneralTabInitialValues },
   }
}

export const buildDraftOfflineEventObject = (
   values: OfflineEventFormValues,
   group: Group,
   author: AuthorInfo,
   firebase: FirebaseService
): OfflineEvent => {
   return {
      group: pickPublicDataFromGroup(group),
      id: null,
      title: values.general.title,
      description: values.general.description,
      targetAudience: values.general.targetAudience,
      registrationUrl: values.general.registrationUrl,
      backgroundImageUrl: values.general.backgroundImageUrl,
      hidden: values.general.hidden,
      address: values.general.address,
      status: "draft",
      industries: group.companyIndustries,
      author: author,
      startAt: values.general.startAt
         ? firebase.getFirebaseTimestamp(values.general.startAt)
         : null,
      createdAt: firebase.getFirebaseTimestamp(new Date()),
      updatedAt: firebase.getFirebaseTimestamp(new Date()),
      lastUpdatedBy: author,
   }
}

type ConvertOfflineEventObjectToFormArgs = {
   offlineEvent: OfflineEvent | null
}

const convertOfflineEventObjectToForm = ({
   offlineEvent,
}: ConvertOfflineEventObjectToFormArgs): OfflineEventFormValues => {
   const general: OfflineEventFormValues["general"] = {
      title: offlineEvent?.title || formGeneralTabInitialValues.title,
      description:
         offlineEvent?.description || formGeneralTabInitialValues.description,
      address: offlineEvent?.address || formGeneralTabInitialValues.address,
      targetAudience:
         offlineEvent?.targetAudience ||
         formGeneralTabInitialValues.targetAudience,
      registrationUrl:
         offlineEvent?.registrationUrl ||
         formGeneralTabInitialValues.registrationUrl,
      startAt:
         offlineEvent?.startAt?.toDate() || formGeneralTabInitialValues.startAt,
      backgroundImageUrl:
         offlineEvent?.backgroundImageUrl ||
         formGeneralTabInitialValues.backgroundImageUrl,
      hidden: offlineEvent?.hidden || formGeneralTabInitialValues.hidden,
   }

   return {
      general,
   }
}

export const convertFormValuesToOfflineEventObject = (
   values: OfflineEventFormValues,
   group: Group,
   author: AuthorInfo,
   firebase: FirebaseService
): OfflineEvent => {
   return buildDraftOfflineEventObject(values, group, author, firebase)
}

type Props = {
   offlineEvent: OfflineEvent
   group: Group
   children: ReactNode
}

const OfflineEventFormikProvider = ({ offlineEvent, children }: Props) => {
   const formValues: OfflineEventFormValues = offlineEvent
      ? convertOfflineEventObjectToForm({
           offlineEvent,
        })
      : getFormInitialValues()

   return (
      <Formik<OfflineEventFormValues>
         initialValues={formValues}
         onSubmit={undefined}
         validationSchema={offlineEventFormValidationSchema}
      >
         {children}
      </Formik>
   )
}

export default OfflineEventFormikProvider

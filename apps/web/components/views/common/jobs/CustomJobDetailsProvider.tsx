import {
   CustomJob,
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups/groups"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useUserJobApplication from "components/custom-hook/custom-job/useUserJobApplication"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import useGroupsByIds from "components/custom-hook/useGroupsByIds"
import { useAuth } from "HOCs/AuthProvider"
import React, {
   createContext,
   ReactNode,
   useContext,
   useEffect,
   useMemo,
} from "react"
import { useSelector } from "react-redux"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"

interface CustomJobDetailsContextType {
   customJob: CustomJob
   source: CustomJobApplicationSource
   isApplyConfirmationOpen: boolean
   isRemoveConfirmationOpen: boolean
   applicationInitiatedOnly: boolean
   isAutoApply: boolean
   handleConfirmationOpen: () => void
   handleConfirmationClose: () => void
   handleRemoveJobOpen: () => void
   handleRemoveJobClose: () => void
   handleClickApplyBtn: () => void
   handleConfirmApply: () => void
   group?: Group
   suspense?: boolean
   hideApplicationConfirmation?: boolean
   hideLinkedLivestreams?: boolean
   hideLinkedSparks?: boolean
   hideCTAButtons?: boolean
}

const CustomJobDetailsContext = createContext<
   CustomJobDetailsContextType | undefined
>(undefined)

interface CustomJobDetailsProviderProps {
   children: ReactNode
   customJob: CustomJob
   source: CustomJobApplicationSource
   suspense?: boolean
   hideApplicationConfirmation?: boolean
   hideLinkedLivestreams?: boolean
   hideLinkedSparks?: boolean
   hideCTAButtons?: boolean
}

export const CustomJobDetailsProvider: React.FC<
   CustomJobDetailsProviderProps
> = (props: CustomJobDetailsProviderProps) => {
   const {
      customJob,
      source,
      children,
      suspense,
      hideApplicationConfirmation,
      hideLinkedLivestreams,
      hideLinkedSparks,
      hideCTAButtons,
   } = props
   const { data: fingerPrintId } = useFingerPrint()

   const { userData } = useAuth()

   const { applicationInitiatedOnly: shouldOpenApplyConfirmation } =
      useUserJobApplication(userData?.id || fingerPrintId, customJob.id)
   const [
      isApplyConfirmationOpen,
      handleConfirmationOpen,
      handleConfirmationClose,
   ] = useDialogStateHandler(false)

   const [isRemoveConfirmationOpen, handleRemoveJobOpen, handleRemoveJobClose] =
      useDialogStateHandler(false)

   const { applicationInitiatedOnly, handleClickApplyBtn, handleConfirmApply } =
      useCustomJobApply(customJob as PublicCustomJob, source)

   const { data: jobGroups } = useGroupsByIds([customJob.groupId], suspense)

   const group = jobGroups?.at(0)

   useEffect(() => {
      if (shouldOpenApplyConfirmation) handleConfirmationOpen()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [shouldOpenApplyConfirmation])

   const autoActionType = useSelector(autoAction)
   const isAutoApply = autoActionType === AutomaticActions.APPLY

   const value = useMemo<CustomJobDetailsContextType>(
      () => ({
         customJob,
         source,
         isApplyConfirmationOpen,
         isRemoveConfirmationOpen,
         applicationInitiatedOnly,
         isAutoApply,
         handleConfirmationOpen,
         handleConfirmationClose,
         handleRemoveJobOpen,
         handleRemoveJobClose,
         handleClickApplyBtn,
         handleConfirmApply,
         group,
         suspense,
         hideApplicationConfirmation,
         hideLinkedLivestreams,
         hideLinkedSparks,
         hideCTAButtons,
      }),
      [
         customJob,
         source,
         isApplyConfirmationOpen,
         isRemoveConfirmationOpen,
         applicationInitiatedOnly,
         isAutoApply,
         handleConfirmationOpen,
         handleConfirmationClose,
         handleRemoveJobOpen,
         handleRemoveJobClose,
         handleClickApplyBtn,
         handleConfirmApply,
         group,
         suspense,
         hideApplicationConfirmation,
         hideLinkedLivestreams,
         hideLinkedSparks,
         hideCTAButtons,
      ]
   )

   return (
      <CustomJobDetailsContext.Provider value={value}>
         {children}
      </CustomJobDetailsContext.Provider>
   )
}

export const useCustomJobDetailsDialog = () => {
   const context = useContext(CustomJobDetailsContext)
   if (context === undefined) {
      throw new Error(
         "useCustomJobDetailsDialog must be used within a CustomJobDetailsProvider"
      )
   }
   return context
}

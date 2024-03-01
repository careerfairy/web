import { Job } from "@careerfairy/shared-lib/ats/Job"
import {
   MergeExtraRequiredData,
   MergeMetaEntities,
   MergeMetaResponse,
} from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { useATSAccount } from "components/views/group/admin/ats-integration/ATSAccountContextProvider"
import {
   RequiredComponentsMap,
   requiredComponents,
} from "components/views/group/admin/ats-integration/application-test/RequiredFields"
import { atsServiceInstance } from "data/firebase/ATSService"
import { useReducer, useCallback, useMemo } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import useMergeMetaEndpoint from "./useMergeMetaEndpoint"
import { getIntegrationSpecifics } from "@careerfairy/shared-lib/dist/ats/IntegrationSpecifics"

export type State = {
   job: Job | null // selected job
   data: MergeExtraRequiredData
   dataIsComplete: boolean
   requiredFieldsCount: number
   readyToTest: boolean
   testedSuccessfully: boolean
}

const initialState: State = {
   job: null,
   data: {},
   dataIsComplete: false,
   requiredFieldsCount: 0,
   readyToTest: false,
   testedSuccessfully: undefined,
}

export const stateMachine = createSlice({
   name: "applicationTest",
   reducers: {
      selectJob: (state, action: PayloadAction<Job>) => {
         state.job = action.payload

         updateStateIfDataComplete(state)
      },
      setData: (
         state,
         action: PayloadAction<Partial<MergeExtraRequiredData>>
      ) => {
         state.data = { ...state.data, ...action.payload }

         updateStateIfDataComplete(state)
      },
      submit: (state) => {
         state.testedSuccessfully = null // loading state
      },
      successResult: (state) => {
         state.testedSuccessfully = true
      },
      errorResult: (state) => {
         state.testedSuccessfully = false
      },
   },
   initialState,
})

const { submit, successResult, errorResult } = stateMachine.actions

type Props = {
   onSuccess?: () => void
   onError?: () => void
}

const useAtsApplicationTest = ({ onSuccess, onError }: Props = {}) => {
   const { atsAccount } = useATSAccount()
   const specifics = getIntegrationSpecifics(atsAccount)

   const metaToFetch: MergeMetaEntities[] = useMemo(() => {
      // when doing a nested write, we check the requirements for the applications model
      // otherwise, we check the requirements for the candidates + attachments
      return specifics.candidateCVAsANestedWrite
         ? ["applications"]
         : ["candidates", "attachments"]
   }, [specifics.candidateCVAsANestedWrite])

   const meta = useMergeMetaEndpoint(
      atsAccount.groupId,
      atsAccount.id,
      metaToFetch
   )

   const requiredFields: string[] = useMemo(
      () => extractRequiredFieldsFromMeta(meta),
      [meta]
   )
   // Map of components the user needs to act on
   const components: RequiredComponentsMap = useMemo(
      () => filterMapWithKeys(requiredComponents, requiredFields),
      [requiredFields]
   )

   const [state, dispatch] = useReducer(stateMachine.reducer, {
      ...initialState,
      requiredFieldsCount: Object.keys(components).length,
   })

   const onSubmit = useCallback(() => {
      dispatch(submit())

      atsServiceInstance
         .candidateApplicationTest(
            atsAccount.groupId,
            atsAccount.id,
            state.job.id,
            state.data
         )
         .then(() => {
            return atsServiceInstance.setAccountCandidateTestComplete(
               atsAccount.groupId,
               atsAccount.id,
               state.data
            )
         })
         .then(() => {
            dispatch(successResult())
            onSuccess?.()
         })
         .catch((e) => {
            errorLogAndNotify(e)
            dispatch(errorResult())
            onError?.()
         })
   }, [
      atsAccount.groupId,
      atsAccount.id,
      onError,
      onSuccess,
      state.data,
      state.job?.id,
   ])

   const isLoading = state.testedSuccessfully === null

   const result = useMemo(
      () => ({
         isLoading,
         components,
         onSubmit,
         state,
         dispatch,
         actions: stateMachine.actions,
      }),
      [components, isLoading, onSubmit, state]
   )

   return result
}

/**
 * Checks if all values in the object are truthy
 * @param obj The object to check
 * @returns true if all values are truthy, false otherwise
 */
const allValuesTruthy = (obj: unknown) => {
   return Object.values(obj).every((value) => value)
}

/**
 * Creates a new map with the received keys if they exist
 * @param map
 * @param keys
 */
const filterMapWithKeys = (map: object, keys: string[]) => {
   return Object.entries(map).reduce((acc, [key, value]) => {
      if (keys?.includes(key)) {
         acc[key] = value
      }

      return acc
   }, {})
}

const updateStateIfDataComplete = (state: State) => {
   state.dataIsComplete =
      Object.keys(state.data).length === state.requiredFieldsCount &&
      allValuesTruthy(state.data)
   state.readyToTest = state.dataIsComplete && Boolean(state.job)
}

const extractRequiredFieldsFromMeta = (meta: MergeMetaResponse[]) => {
   const requiredFields: Set<string> = new Set()

   meta
      .map((m) => m?.request_schema?.required)
      .flat()
      .filter((f) => f)
      .forEach((f) => requiredFields.add(f))

   return Array.from(requiredFields)
}

export default useAtsApplicationTest

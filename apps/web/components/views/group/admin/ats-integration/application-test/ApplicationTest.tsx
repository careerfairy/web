import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import {
   MergeExtraRequiredData,
   MergeMetaEntities,
   MergeMetaResponse,
} from "@careerfairy/shared-lib/dist/ats/merge/MergeResponseTypes"
import { useATSAccount } from "../ATSAccountContextProvider"
import useMergeMetaEndpoint from "../../../../../custom-hook/ats/useMergeMetaEndpoint"
import { useCallback, useMemo, useReducer } from "react"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import Stack from "@mui/material/Stack"
import LoadingButton from "@mui/lab/LoadingButton"
import { requiredComponents, RequiredComponentsMap } from "./RequiredFields"
import JobList from "./JobList"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import CircularLoader from "components/views/loader/CircularLoader"
import Typography from "@mui/material/Typography"
import { atsServiceInstance } from "../../../../../../data/firebase/ATSService"
import { errorLogAndNotify } from "../../../../../../util/CommonUtil"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import { getIntegrationSpecifics } from "@careerfairy/shared-lib/dist/ats/IntegrationSpecifics"

type State = {
   job: Job | null // selected job
   data: MergeExtraRequiredData
   dataIsComplete: boolean
   requiredFieldsCount: number
   readyToTest: boolean
   testedSuccessfully: boolean
}

const initialState = {
   job: null,
   data: {},
   dataIsComplete: false,
   requiredFieldsCount: 0,
   readyToTest: false,
   testedSuccessfully: undefined,
} as State

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

const { selectJob, setData, submit, successResult, errorResult } =
   stateMachine.actions

export const ApplicationTest = () => {
   const { atsAccount } = useATSAccount()
   const specifics = getIntegrationSpecifics(atsAccount)

   const metasToFetch: MergeMetaEntities[] = useMemo(() => {
      // when doing a nested write, we check the requirements for the applications model
      // otherwise, we check the requirements for the candidates + attachments
      return specifics.candidateCVAsANestedWrite
         ? ["applications"]
         : ["candidates", "attachments"]
   }, [specifics.candidateCVAsANestedWrite])

   const metas = useMergeMetaEndpoint(
      atsAccount.groupId,
      atsAccount.id,
      metasToFetch
   )

   const { successNotification } = useSnackbarNotifications()

   const requiredFields: string[] = useMemo(
      () => extractRequiredFieldsFromMetas(metas),
      [metas]
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
         .then((_) => {
            return atsServiceInstance.setAccountCandidateTestComplete(
               atsAccount.groupId,
               atsAccount.id,
               state.data
            )
         })
         .then((_) => {
            dispatch(successResult())
            successNotification(successMessage)
         })
         .catch((e) => {
            errorLogAndNotify(e)
            dispatch(errorResult())
         })
   }, [
      atsAccount.groupId,
      atsAccount.id,
      state.data,
      state.job?.id,
      successNotification,
   ])

   const isLoading = state.testedSuccessfully === null

   return (
      <>
         <Stack spacing={2}>
            <SuspenseWithBoundary fallback={<CircularLoader />}>
               <JobList
                  disabled={isLoading}
                  onChange={(job) => dispatch(selectJob(job))}
               />
            </SuspenseWithBoundary>

            {Object.entries(components).map(([requiredField, component]) => (
               <SuspenseWithBoundary
                  fallback={<CircularLoader />}
                  key={`suspense-${requiredField}`}
               >
                  {component((value) => {
                     dispatch(setData({ [requiredField]: value }))
                  }, isLoading)}
               </SuspenseWithBoundary>
            ))}

            <LoadingButton
               variant={"contained"}
               color={"secondary"}
               disabled={
                  !state.readyToTest || state.testedSuccessfully === true
               }
               loading={isLoading}
               onClick={onSubmit}
            >
               Test
            </LoadingButton>

            {state.testedSuccessfully === true && (
               <Typography color="green" align={"center"} p={2}>
                  {successMessage}
               </Typography>
            )}

            {state.testedSuccessfully === false && (
               <Typography color="error" align="center" p={2}>
                  The Test Application failed with an error. We&apos;ll analyse
                  it and will get back to you soon.
               </Typography>
            )}
         </Stack>
      </>
   )
}

const successMessage =
   "Application was successful! You can now associate jobs to livestreams and start your recruiting journey!"

function allValuesTruthy(obj: any) {
   return Object.values(obj).every((value) => value)
}

/**
 * Creates a new map with the received keys if they exist
 * @param map
 * @param keys
 */
function filterMapWithKeys(map: object, keys: string[]) {
   return Object.entries(map).reduce((acc, [key, value]) => {
      if (keys?.includes(key)) {
         acc[key] = value
      }

      return acc
   }, {})
}

function updateStateIfDataComplete(state: State) {
   state.dataIsComplete =
      Object.keys(state.data).length === state.requiredFieldsCount &&
      allValuesTruthy(state.data)
   state.readyToTest = state.dataIsComplete && Boolean(state.job)
}

function extractRequiredFieldsFromMetas(metas: MergeMetaResponse[]) {
   let requiredFields: Set<string> = new Set()

   metas
      .map((m) => m?.request_schema?.required)
      .flat()
      .filter((f) => f)
      .forEach((f) => requiredFields.add(f))

   return Array.from(requiredFields)
}

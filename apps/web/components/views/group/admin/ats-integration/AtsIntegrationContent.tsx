import Header from "../Header"
import Box from "@mui/material/Box"
import { useSelector } from "react-redux"
import { groupSelector } from "../../../../../store/selectors/groupSelectors"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { useSnackbar } from "notistack"
import { atsServiceInstance } from "../../../../../data/firebase/ATSService"
import * as Sentry from "@sentry/nextjs"
import { useMergeLink } from "@mergeapi/react-merge-link"
import { useCallback, useEffect, useReducer, useState } from "react"
import LoadingButton from "@mui/lab/LoadingButton"

const AtsIntegrationContent = () => {
   return (
      <>
         <Header
            title={"Applicants Tracking System"}
            subtitle={"Manage your ATS integrations"}
         />
         <Box p={3}>
            <ConnectWithATSSystem />
         </Box>
      </>
   )
}

const initialState = {
   isLoading: false,
   linkToken: null,
   mergeLinkIsReady: false,
   integrationId: null,
}

type Action =
   | { type: "START"; payload: string }
   | { type: "LINK_TOKEN_GRABBED"; payload: string }
   | { type: "MERGE_LINK_READY"; payload: boolean }
   | { type: "COMPLETE" }

type State = typeof initialState

function reducer(state: State, action: Action): State {
   switch (action.type) {
      case "START":
         return {
            ...state,
            isLoading: true,
            integrationId: action.payload,
         }
      case "LINK_TOKEN_GRABBED":
         return {
            ...state,
            // the user can close the Merge dialog so we stop the loading state here
            isLoading: false,
            linkToken: action.payload,
         }
      case "MERGE_LINK_READY": {
         return {
            ...state,
            mergeLinkIsReady: action.payload,
         }
      }
      case "COMPLETE": {
         return {
            ...state,
            isLoading: false,
         }
      }
      default:
         throw new Error(`Unknown action: ${action}`)
   }
}

const ConnectWithATSSystem = () => {
   const group: Group = useSelector(groupSelector)
   const { enqueueSnackbar } = useSnackbar()
   const [state, dispatch] = useReducer(reducer, initialState)

   const startLink = async () => {
      const integrationId = atsServiceInstance.generateIntegrationId()

      console.log("generated integration id", integrationId)
      dispatch({
         type: "START",
         payload: integrationId,
      })

      try {
         const response = await atsServiceInstance.linkCompanyWithATS(
            group.groupId,
            integrationId
         )

         console.log(response)

         dispatch({ type: "LINK_TOKEN_GRABBED", payload: response.link_token })
      } catch (e) {
         Sentry.captureException(e)
         enqueueSnackbar(
            "The integration call with the ATS system failed, try again later",
            {
               variant: "error",
               preventDuplicate: true,
            }
         )
      }
   }

   console.log("ConnectWithATSSystem render", state)

   return (
      <>
         <LoadingButton
            variant="contained"
            onClick={startLink}
            loading={state.isLoading}
         >
            Associate new integrations with Merge
         </LoadingButton>

         <MergeDialogConnector
            groupId={group.groupId}
            linkToken={state.linkToken}
            integrationId={state.integrationId}
            dispatch={dispatch}
         />
      </>
   )
}

const MergeDialogConnector = ({
   linkToken,
   groupId,
   integrationId,
   dispatch,
}) => {
   console.log("MergeDialogConnector render", linkToken, groupId, integrationId)

   const { enqueueSnackbar } = useSnackbar()

   // Finalize the integration
   const onSuccess = useCallback(
      (public_token) => {
         console.log("success!!", public_token)
         try {
            atsServiceInstance
               .exchangeAccountToken(groupId, integrationId, public_token)
               .then((_) => {
                  console.log("Account Token saved")

                  dispatch({ type: "COMPLETE" })
               })
         } catch (e) {
            Sentry.captureException(e)
            enqueueSnackbar(
               "We could not finalize the ATS setup, try again later",
               {
                  variant: "error",
                  preventDuplicate: true,
               }
            )
         }
      },
      [groupId, integrationId]
   )

   const { open, isReady, error } = useMergeLink({
      linkToken: linkToken,
      onSuccess,
   })

   // capture MergeLink errors
   useEffect(() => {
      if (error) {
         console.error("Merge Link has an error", error)
         Sentry.captureException(error)
      }
   }, [error])

   // Open the dialog if requirements are met
   useEffect(() => {
      if (isReady && linkToken && groupId && integrationId) {
         open()
      }
   }, [linkToken, groupId, isReady, integrationId])

   // Propagate to parent the readiness of MergeLink
   useEffect(() => {
      dispatch({ type: "MERGE_LINK_READY", payload: isReady })
   }, [isReady])

   return null
}

export default AtsIntegrationContent

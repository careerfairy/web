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
}

type Action =
   | { type: "START" }
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
         }
      case "LINK_TOKEN_GRABBED":
         return {
            ...state,
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
      dispatch({ type: "START" })

      try {
         const response = await atsServiceInstance.linkCompanyWithATS(
            group.groupId
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
            dispatch={dispatch}
         />
      </>
   )
}

const MergeDialogConnector = ({ linkToken, groupId, dispatch }) => {
   console.log("MergeDialogConnector render", linkToken, groupId)

   const { enqueueSnackbar } = useSnackbar()
   const onSuccess = useCallback((public_token) => {
      console.log("success!!", public_token)
      try {
         atsServiceInstance
            .exchangeAccountToken(groupId, public_token)
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
   }, [])

   const { open, isReady } = useMergeLink({
      linkToken: linkToken,
      onSuccess,
   })

   useEffect(() => {
      if (isReady && linkToken && groupId) {
         open()
      }
   }, [linkToken, groupId, isReady])

   useEffect(() => {
      dispatch({ type: "MERGE_LINK_READY", payload: isReady })
   }, [isReady])

   return null
}

export default AtsIntegrationContent

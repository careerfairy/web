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
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import useGroupATSAccounts from "../../../../custom-hook/useGroupATSAccounts"

const AtsIntegrationContent = () => {
   const group: Group = useSelector(groupSelector)
   const { data, isLoading } = useGroupATSAccounts(group?.groupId)
   console.log("Render AtsIntegrationContent Group", group)
   console.log("Render AtsIntegrationContent ATS", isLoading, data)

   const [show, setShow] = useState(false)

   useEffect(() => {
      const timer = setTimeout(() => {
         setShow(true)
      }, 5000)

      return () => clearTimeout(timer)
   }, [])

   return (
      <>
         <Header
            title={"Applicants Tracking System"}
            subtitle={"Manage your ATS integrations"}
         />
         {show && <Test />}
         <Box p={3}>{/*<ConnectWithATSSystem />*/}</Box>
      </>
   )
}

const Test = () => {
   const group: Group = useSelector(groupSelector)
   const { data, isLoading } = useGroupATSAccounts(group?.groupId)

   console.log("render from Test!")
   return (
      <div>
         Test component, loading = {isLoading + ""}, data = {data.length}
      </div>
   )
}

const initialState = {
   isLoading: false,
   linkToken: null,
   mergeLinkIsReady: false,
   integrationId: null,
   complete: false,
}

const atsState = createSlice({
   name: "ats",
   reducers: {
      start: (state, action: PayloadAction<string>) => {
         state.isLoading = true
         state.integrationId = action.payload
      },
      linkTokenGrabbed: (state, action: PayloadAction<string>) => {
         state.isLoading = false
         state.linkToken = action.payload
      },
      mergeLinkReady: (state, action: PayloadAction<boolean>) => {
         state.mergeLinkIsReady = action.payload
      },
      complete: (state) => {
         state.complete = true
         state.isLoading = false
      },
   },
   initialState,
})

const { start, linkTokenGrabbed, mergeLinkReady, complete } = atsState.actions

const ConnectWithATSSystem = () => {
   const group: Group = useSelector(groupSelector)
   const { enqueueSnackbar } = useSnackbar()
   const [state, dispatch] = useReducer(atsState.reducer, initialState)

   const startLink = async () => {
      const integrationId = atsServiceInstance.generateIntegrationId()
      dispatch(start(integrationId))

      try {
         const response = await atsServiceInstance.linkCompanyWithATS(
            group.groupId,
            integrationId
         )

         dispatch(linkTokenGrabbed(response.link_token))
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
   const { enqueueSnackbar } = useSnackbar()

   // Finalize the integration
   const onSuccess = useCallback(
      (public_token) => {
         try {
            atsServiceInstance
               .exchangeAccountToken(groupId, integrationId, public_token)
               .then((_) => {
                  dispatch(complete())
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
      dispatch(mergeLinkReady(isReady))
   }, [isReady])

   return null
}

export default AtsIntegrationContent

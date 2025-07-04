import { useMergeLink } from "@mergeapi/react-merge-link"
import LoadingButton from "@mui/lab/LoadingButton"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import * as Sentry from "@sentry/nextjs"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback, useEffect, useReducer } from "react"
import { atsServiceInstance } from "../../../../../data/firebase/ATSService"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"

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

const LinkAccountButton = ({ title }: { title: string }) => {
   const { group } = useGroup()
   const { errorNotification } = useSnackbarNotifications()
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
         errorNotification(
            e,
            "The integration call with the ATS system failed, try again later"
         )
         dispatch(complete())
      }
   }

   return (
      <>
         <LoadingButton
            variant="contained"
            onClick={startLink}
            loading={state.isLoading}
         >
            {title}
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
   const { errorNotification } = useSnackbarNotifications()

   // Finalize the integration
   const onSuccess = useCallback(
      (public_token: string) => {
         try {
            atsServiceInstance
               .exchangeAccountToken(groupId, integrationId, public_token)
               .then(() => {
                  dispatch(complete())
               })
         } catch (e) {
            errorNotification(
               e,
               "We could not finalize the ATS setup, try again later"
            )
         }
      },
      [dispatch, errorNotification, groupId, integrationId]
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
   }, [linkToken, groupId, isReady, integrationId, open])

   // Propagate to parent the readiness of MergeLink
   useEffect(() => {
      dispatch(mergeLinkReady(isReady))
   }, [dispatch, isReady])

   return null
}

export default LinkAccountButton

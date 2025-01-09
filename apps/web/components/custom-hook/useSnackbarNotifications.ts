import { OptionsObject } from "notistack"
import { useCallback, useMemo } from "react"
import { useDispatch } from "react-redux"
import { sendGeneralError, sendSuccessMessage } from "../../store/actions"

/**
 * Trigger snackbar toast notifications
 *
 * Returns callbacks that are hooked into redux
 */
const useSnackbarNotifications = () => {
   const dispatch = useDispatch()

   const successNotification = useCallback(
      (message: string, title?: string, options?: OptionsObject) => {
         return dispatch(sendSuccessMessage(message, title, options))
      },
      [dispatch]
   )

   const errorNotification = useCallback(
      (
         errorForSentry: Error | string,
         snackbarMessage?: string,
         extraSentryInfo?: object,
         options?: OptionsObject
      ) => {
         return dispatch(
            sendGeneralError(
               errorForSentry,
               snackbarMessage,
               extraSentryInfo,
               options
            )
         )
      },
      [dispatch]
   )

   return useMemo(() => {
      return {
         successNotification,
         errorNotification,
      }
   }, [successNotification, errorNotification])
}

export default useSnackbarNotifications

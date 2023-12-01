import { useDispatch } from "react-redux"
import { useCallback, useMemo } from "react"
import { sendGeneralError, sendSuccessMessage } from "../../store/actions"

/**
 * Trigger snackbar toast notifications
 *
 * Returns callbacks that are hooked into redux
 */
const useSnackbarNotifications = () => {
   const dispatch = useDispatch()

   const successNotification = useCallback(
      (message: string, title?: string) => {
         return dispatch(sendSuccessMessage(message, title))
      },
      [dispatch]
   )

   const errorNotification = useCallback(
      (
         sentryError: Error | string,
         snackbarMessage?: string,
         extraSentryInfo?: object
      ) => {
         return dispatch(
            sendGeneralError(sentryError, snackbarMessage, extraSentryInfo)
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

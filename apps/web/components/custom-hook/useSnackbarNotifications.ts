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
      (error: Error | string, message?: string, extra?: object) => {
         return dispatch(sendGeneralError(error, message, extra))
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

import {
   CLOSE_SNACKBAR,
   ENQUEUE_SNACKBAR,
   REMOVE_SNACKBAR,
} from "./actionTypes"
import { GENERAL_ERROR } from "../../components/util/constants"
import { getCtaSnackBarProps } from "../../components/util/constants/callToActions"
import { careerfairyLogo } from "../../constants/images"
import * as actions from "./index"
import CallToActionSnackbar from "../../components/views/streaming/sharedComponents/StreamNotifications/CallToActionSnackbar"
import React from "react"
import * as Sentry from "@sentry/nextjs"
import CustomNotification from "../../components/views/notifications/CustomNotification"

/**
 * Enqueue a snackbar managed in redux state.
 * options: ({
 * anchorOrigin: {horizontal: string, vertical: string},
 * variant: ('default' | 'error' | 'success' | 'warning' | 'info')
 * key: string,
 * action: object
 * }),
 * message: string
 * }} [notification]
 * @param notification
 */
export const enqueueSnackbar = (
   notification = { message: "", options: {} }
) => {
   const key = notification.options && notification.options.key

   return {
      type: ENQUEUE_SNACKBAR,
      notification: {
         ...notification,
         key: key || new Date().getTime() + Math.random(),
      },
   }
}

export const closeSnackbar = (key) => ({
   type: CLOSE_SNACKBAR,
   dismissAll: !key, // dismiss all if no key has been defined
   key,
})

export const removeSnackbar = (key) => ({
   type: REMOVE_SNACKBAR,
   key,
})

export const sendGeneralError =
   (errorInstance, message = GENERAL_ERROR, extra = {}) =>
   async (dispatch) => {
      const error = errorInstance || ""
      console.error("error", error)
      Sentry.captureException(error, { extra })

      if (process.env.NODE_ENV === "development") {
         const devInfo =
            "This type of error only appears in development, it will just show a general error in production."
         if (typeof error === "string") {
            message = `${error} - ${devInfo}`
         }
         if (typeof error?.message === "string") {
            message = `${error.message} - ${devInfo}`
         }
      }

      dispatch(
         enqueueSnackbar({
            message: message,
            options: {
               variant: "error",
               preventDuplicate: true,
            },
         })
      )
   }

export const sendSuccessMessage =
   (message = "Success", title) =>
   async (dispatch) => {
      dispatch(
         enqueueSnackbar({
            message: message,
            options: {
               variant: "success",
               preventDuplicate: true,
               key: message,
               content: (key, message) => (
                  <CustomNotification
                     title={title}
                     variant="success"
                     id={key}
                     message={message}
                  />
               ),
            },
         })
      )
   }
export const enqueueBroadcastMessage =
   (message = "", action) =>
   async (dispatch) => {
      dispatch(
         enqueueSnackbar({
            message: message,
            options: {
               variant: "warning",
               preventDuplicate: true,
               key: message,
               action,
               anchorOrigin: {
                  vertical: "top",
                  horizontal: "center",
               },
            },
         })
      )
   }
export const enqueueCallToAction =
   ({ content, callToActionId }) =>
   async (dispatch) => {
      dispatch(
         enqueueSnackbar({
            options: {
               variant: "info",
               preventDuplicate: true,
               persist: true,
               key: callToActionId,
               content,
               anchorOrigin: {
                  vertical: "top",
                  horizontal: "center",
               },
            },
         })
      )
   }

export const enqueueJobPostingCta =
   (callToActionDataWithId, handleClick, handleDismiss) => async (dispatch) => {
      const {
         icon,
         buttonUrl,
         buttonText,
         callToActionId,
         salary,
         applicationDeadline,
         snackBarImage,
         message,
         jobTitle,
         isJobPosting,
         isForTutorial,
      } = getCtaSnackBarProps(callToActionDataWithId, careerfairyLogo)

      dispatch(
         actions.enqueueCallToAction({
            message,
            callToActionId,
            content: (
               <CallToActionSnackbar
                  onClick={handleClick}
                  onDismiss={handleDismiss}
                  icon={icon}
                  isForTutorial={isForTutorial}
                  buttonText={buttonText}
                  buttonUrl={buttonUrl}
                  jobTitle={jobTitle}
                  salary={salary}
                  snackBarImage={snackBarImage}
                  applicationDeadline={applicationDeadline}
                  isJobPosting={isJobPosting}
                  message={message}
               />
            ),
         })
      )
   }

/**
 * Call an on call cloud function to generate a secure agora token.
 * @param {{options: {anchorOrigin: {horizontal: string, vertical: string}, key: string}, message: string}} data
 */
export const sendCustomError =
   (data = {}) =>
   async (dispatch) => {
      console.error("error", data.message)
      dispatch(
         enqueueSnackbar({
            message: data.message,
            options: {
               variant: "error",
               preventDuplicate: true,
               ...data.options,
            },
         })
      )
   }

// enqueue hand raise request sent

const key = "Your hand raise request has been sent, please wait to be invited."
export const enqueueSuccessfulHandRaiseRequest = () => async (dispatch) => {
   return dispatch(
      enqueueSnackbar({
         message: key,
         options: {
            key,
            variant: "info",
            preventDuplicate: true,
         },
      })
   )
}
export const closeSuccessfulHandRaiseRequest = () => async (dispatch) => {
   return dispatch(closeSnackbar(key))
}

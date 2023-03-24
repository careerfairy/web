import { firebaseServiceInstance } from "../../../../../../../data/firebase/FirebaseService"
import useSWRMutation from "swr/mutation"
import { PdfReportData } from "@careerfairy/shared-lib/groups/pdf-report"
import { useAuth } from "../../../../../../../HOCs/AuthProvider"
import { useEffect } from "react"

type Options = {
   onSuccess?: (data: PdfReportData) => void
   onError?: (err: Error) => void
}

/**
 * Custom hook to fetch PDF report data for a specific livestream based on given parameters.
 * @param {string} targetGroupId - The ID of the target group for which the report data is being fetched.
 * @param {string} targetStreamId - The ID of the target stream for which the report data is being fetched.
 * @param {Options} options - Optional object containing onSuccess and onError callbacks.
 * @param {function} options.onSuccess - Optional callback function to be called upon successful data fetch.
 * @param {function} options.onError - Optional callback function to be called upon an error in data fetch.
 * @returns {Object} - Response object containing data, error, and loading status.
 */
const usePDFReportData = (
   targetGroupId: string,
   targetStreamId: string,
   options: Options = {}
) => {
   const { userData } = useAuth()

   const key = `export-livestream-${targetStreamId}-pdf-report-for${targetGroupId}`

   const response = useSWRMutation<PdfReportData>(
      key,
      async () => {
         const { data } = await firebaseServiceInstance.getLivestreamReportData(
            {
               targetStreamId,
               userEmail: userData.userEmail,
               targetGroupId,
            }
         )
         return data
      },
      {
         onSuccess: options.onSuccess,
         onError: options.onError,
         throwOnError: false, // We don't want to throw an error, we want to handle it ourselves in the onError callback above
      }
   )

   useEffect(() => {
      response.reset() // Reset the cache when the key changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [key])

   return response
}

export default usePDFReportData

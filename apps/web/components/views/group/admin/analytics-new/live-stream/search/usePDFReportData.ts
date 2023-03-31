import { firebaseServiceInstance } from "../../../../../../../data/firebase/FirebaseService"
import useSWRMutation from "swr/mutation"
import { PdfReportData } from "@careerfairy/shared-lib/groups/pdf-report"
import { useAuth } from "../../../../../../../HOCs/AuthProvider"
import { useMemo } from "react"

type Options = {
   onSuccess?: (data: PdfReportData) => void
   onError?: (err: Error) => void
}

type PdfReportDataResponse = {
   // The fetched data
   data: PdfReportData
   // Boolean indicating whether the data is being fetched
   isFetching: boolean
   // Function to trigger the data fetch
   fetchReportData: () => Promise<void>
}

/**
 * Custom hook to fetch PDF report data for a specific livestream based on given parameters only when the fetchReportData function is called.
 * @param {string} targetGroupId - The ID of the target group for which the report data is being fetched.
 * @param {string} targetStreamId - The ID of the target stream for which the report data is being fetched.
 * @param {Options} options - Optional object containing onSuccess and onError callbacks.
 * @param {function} options.onSuccess - Optional callback function to be called upon successful data fetch.
 * @param {function} options.onError - Optional callback function to be called upon an error in data fetch.
 * @returns {PdfReportDataResponse} - Object containing the fetched data, a boolean indicating whether the data is being fetched, and a function to trigger the data fetch.
 */
const usePDFReportData = (
   targetGroupId: string,
   targetStreamId: string,
   options: Options = {}
): PdfReportDataResponse => {
   const { userData } = useAuth()

   const key = `export-livestream-${targetStreamId}-pdf-report-for${targetGroupId}`

   const { isMutating, data, trigger } = useSWRMutation<PdfReportData>(
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

   return useMemo(
      () => ({
         isFetching: isMutating,
         data,
         fetchReportData: () => void trigger(),
      }),
      [isMutating, data, trigger]
   )
}

export default usePDFReportData

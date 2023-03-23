import { firebaseServiceInstance } from "../../../../../../../data/firebase/FirebaseService"
import useSWRMutation from "swr/mutation"
import { PdfReportData } from "@careerfairy/shared-lib/groups/pdf-report"
import { useAuth } from "../../../../../../../HOCs/AuthProvider"
import { useEffect } from "react"

type Options = {
   onSuccess?: (data: PdfReportData) => void
   onError?: (err: Error) => void
}
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

import { CategoryDataOption } from "@careerfairy/shared-lib/livestreams"
import FirebaseService from "data/firebase/FirebaseService"
import { livestreamService } from "data/firebase/LivestreamService"
import { SWRConfiguration } from "swr"
import useSWRImmutable from "swr/immutable"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching livestream category data with options: ${key}`,
      }),
}

const useLivestreamCategoryDataSWR = (
   firebase: FirebaseService,
   options: CategoryDataOption,
   onSuccess: (data: boolean) => void
) => {
   const swrFetcher = async () => {
      return livestreamService.checkCategoryData(
         firebase,
         options as CategoryDataOption
      )
   }

   return useSWRImmutable(
      `useLivestreamCategoryDataSWR-${options.livestream.id}`,
      swrFetcher,
      {
         ...swrOptions,
         onSuccess,
         revalidateOnMount: true, // refetch the registratioin data when the hook mounts for the first time only. This will ensure that if we navigate out of the live stream room to a different page, then we return back to the room, we re-fetch your reg status
      }
   )
}

export default useLivestreamCategoryDataSWR

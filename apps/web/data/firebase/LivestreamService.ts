import {
   FilterLivestreamsOptions,
   LivestreamQueryOptions,
} from "@careerfairy/shared-lib/livestreams"
import { Functions, httpsCallable } from "firebase/functions"
import { mapFromServerSide } from "util/serverUtil"
import { FunctionsInstance } from "./FirebaseInstance"

export class LivestreamService {
   constructor(private readonly functions: Functions) {}

   /**
    * Fetches livestreams with the given query options
    * @param data  The query options
    * */
   async fetchLivestreams(
      data: LivestreamQueryOptions & FilterLivestreamsOptions
   ) {
      const { data: serializedLivestreams } = await httpsCallable<
         typeof data,
         {
            [field: string]: any
         }[]
      >(
         this.functions,
         "fetchLivestreams_v2"
      )(data)

      return mapFromServerSide(serializedLivestreams)
   }
}

export const livestreamService = new LivestreamService(FunctionsInstance as any)

export default LivestreamService

import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import {
   CompanyFollowed,
   UserData,
   UserStats,
} from "@careerfairy/shared-lib/users"
import CarouselContentService from "components/views/portal/content-carousel/CarouselContentService"
import { useCallback, useMemo } from "react"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: false,
   suspense: false,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching Carousel content via service with options: ${key}`,
      }),
}

export type UseLivestreamCarouselContentSWROptions = {
   userData: UserData
   userStats: UserStats
   pastLivestreams: LivestreamEvent[]
   upcomingLivestreams: LivestreamEvent[]
   registeredRecordedLivestreamsForUser: LivestreamEvent[]
   watchedSparks: Spark[]
   watchedLivestreams: LivestreamEvent[]
   appliedJobs: CustomJobApplicant[]
   userFollowedCompanies: CompanyFollowed[]
}

/**
 * Used to fetch carousel content on the client, serializing the result before returning the data
 * @param options Carousel service options
 * @returns Serialized Carousel Content
 */
const useLivestreamsCarouselContentSWR = (
   options: UseLivestreamCarouselContentSWROptions
) => {
   const key = useMemo(() => JSON.stringify(options), [options])

   const carouselContentService = useMemo(
      () =>
         new CarouselContentService({
            userData: options.userData,
            userStats: options.userStats,
            pastLivestreams: options.pastLivestreams || [],
            upcomingLivestreams: options.upcomingLivestreams || [],
            registeredRecordedLivestreamsForUser:
               options.registeredRecordedLivestreamsForUser || [],
            watchedSparks: options.watchedSparks || [],
            watchedLivestreams: options.watchedLivestreams || [],
            appliedJobs: options.appliedJobs || [],
            followedCompanies: options.userFollowedCompanies,
         }),
      [
         options.appliedJobs,
         options.pastLivestreams,
         options.registeredRecordedLivestreamsForUser,
         options.upcomingLivestreams,
         options.userData,
         options.userFollowedCompanies,
         options.userStats,
         options.watchedLivestreams,
         options.watchedSparks,
      ]
   )

   const swrFetcher = useCallback(
      async () => carouselContentService.getCarouselContent(),
      [carouselContentService]
   )

   const { data } = useSWR(key, swrFetcher, swrOptions)
   return data || []
}

export default useLivestreamsCarouselContentSWR

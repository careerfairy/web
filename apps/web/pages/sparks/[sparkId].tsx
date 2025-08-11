import {
   SerializedSpark,
   SparkCardNotificationTypes,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { queryParamToArr } from "@careerfairy/shared-lib/utils"
import { Button } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { appendCurrentQueryParams } from "components/util/url"
import SparksFeedCarousel from "components/views/sparks-feed/SparksFeedCarousel"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import SparkSeo from "components/views/sparks/components/SparkSeo"
import { sparkService } from "data/firebase/SparksService"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import { Fragment, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useMountedState } from "react-use"
import { RootState } from "store"
import {
   AddCardNotificationPayload,
   addCardNotificationToSparksList,
   fetchInitialSparksFeed,
   fetchInitialSparksFromSearch,
   fetchNextSparks,
   fetchNextSparksFromSearch,
   removeCreatorId,
   removeGroupId,
   removeNotificationsByType,
   resetSearchTransition,
   resetSparksFeed,
   setContentTopicIds,
   setConversionCardInterval,
   setFetchedCompanyWithCreatorStatus,
   setGroupId,
   setInteractionSource,
   setOriginalSparkId,
   setSearchParameters,
   setSparks,
   setUserEmail,
   setVideosMuted,
} from "store/reducers/sparksFeedReducer"
import {
   activeSparkSelector,
   fetchedCompanyWithCreatorStatusSelector,
   fetchNextErrorSelector,
   groupIdSelector,
   hasNoMoreSparksSelector,
   initialSparksFetchedSelector,
   isCreatorFeedSelector,
   isFetchingNextSparksSelector,
   isGroupFeedSelector,
   isInCreatorFeedSelector,
   isOnLastSparkSelector,
   searchResultsExhaustedSelector,
   wasInCreatorFeedSelector,
} from "store/selectors/sparksFeedSelectors"
import { getUserTokenFromCookie } from "util/serverUtil"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const SparksPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
   serializedSpark,
   groupId,
   userEmail,
   conversionInterval,
   interactionSource,
   contentTopic,
}) => {
   const isFullScreen = useSparksFeedIsFullScreen()
   const mounted = useMountedState()

   const { closeSnackbar, enqueueSnackbar } = useSnackbar()
   const dispatch = useDispatch()
   const { replace, query } = useRouter()

   const isOnLastSpark = useSelector(isOnLastSparkSelector)
   const isFetchingNextSparks = useSelector(isFetchingNextSparksSelector)
   const hasNoMoreSparks = useSelector(hasNoMoreSparksSelector)
   const fetchedCompanyWithCreatorStatus = useSelector(
      fetchedCompanyWithCreatorStatusSelector
   )
   const initialSparksFetched = useSelector(initialSparksFetchedSelector)
   const activeSpark = useSelector(activeSparkSelector)
   const fetchNextError = useSelector(fetchNextErrorSelector)
   const isFromGroupPage = useSelector(groupIdSelector)
   const isGroupFeed = useSelector(isGroupFeedSelector)
   const isCreatorFeed = useSelector(isCreatorFeedSelector)
   const isInCreatorFeed = useSelector(isInCreatorFeedSelector)
   const wasInCreatorFeed = useSelector(wasInCreatorFeedSelector)
   const searchResultsExhausted = useSelector(searchResultsExhaustedSelector)
   const currentPlayingIndex = useSelector(
      (state: RootState) => state.sparksFeed.currentPlayingIndex
   )
   const totalSparks = useSelector(
      (state: RootState) => state.sparksFeed.sparks.length
   )
   const searchParameters = useSelector(
      (state: RootState) => state.sparksFeed.searchParameters
   )
   const isSearchMode = Boolean(searchParameters.query)
   const { userData } = useAuth()

   useEffect(() => {
      if ("userActivation" in navigator) {
         dispatch(setVideosMuted(!navigator.userActivation.hasBeenActive))
      }
   }, [dispatch])

   useEffect(() => {
      dispatch(setGroupId(groupId))
      dispatch(setUserEmail(userEmail))

      const originalSpark = SparkPresenter.deserialize(serializedSpark)
      dispatch(setSparks([originalSpark]))
      dispatch(setOriginalSparkId(originalSpark.id))
   }, [dispatch, groupId, serializedSpark, userEmail])

   useEffect(() => {
      if (!contentTopic) {
         dispatch(setContentTopicIds([]))
      } else {
         dispatch(setContentTopicIds([contentTopic]))
      }

      return () => {
         dispatch(setContentTopicIds([]))
      }
   }, [dispatch, contentTopic])

   useEffect(() => {
      const validConversionInterval =
         conversionInterval >= 2 && conversionInterval <= 10
            ? conversionInterval
            : 5

      dispatch(
         setConversionCardInterval(
            userData || isFromGroupPage ? 0 : validConversionInterval
         )
      )

      if (userData) {
         dispatch(
            removeNotificationsByType(SparkCardNotificationTypes.CONVERSION)
         )
      }
   }, [conversionInterval, dispatch, isFromGroupPage, userData])

   // Handle search mode setup by synchronizing URL search parameters with
   // the state machine
   useEffect(() => {
      // Check if we have search parameters from URL
      const isSearchMode = Boolean(query.q)

      if (isSearchMode) {
         // Reset transition state for new search session
         dispatch(resetSearchTransition())

         // Extract search parameters from URL
         const searchParams = {
            query: (query.q as string) || "",
            languages: queryParamToArr(query.languages),
            contentTopics: queryParamToArr(query.contentTopics),
            companySizes: queryParamToArr(query.companySizes),
            industries: queryParamToArr(query.industries),
         }

         dispatch(setSearchParameters(searchParams))
      }
   }, [dispatch, query])

   useEffect(() => {
      if (!groupId) {
         dispatch(removeGroupId())
      }

      const isSearchMode = Boolean(query.q)

      // Use search-based fetching if coming from search, otherwise use regular feed
      if (isSearchMode) {
         dispatch(fetchInitialSparksFromSearch())
      } else {
         dispatch(fetchInitialSparksFeed())
      }

      return () => {
         dispatch(resetSparksFeed())
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [groupId, query.q])

   useEffect(() => {
      if (!interactionSource) {
         dispatch(setInteractionSource(null))
      }

      dispatch(setInteractionSource(interactionSource))

      return () => {
         dispatch(setInteractionSource(null))
      }
   }, [dispatch, interactionSource])

   useEffect(() => {
      if (
         initialSparksFetched &&
         isOnLastSpark &&
         !isFetchingNextSparks &&
         (isSearchMode || !hasNoMoreSparks) &&
         !fetchNextError &&
         (fetchedCompanyWithCreatorStatus === "unset" ||
            fetchedCompanyWithCreatorStatus === "finished")
      ) {
         // For search mode: either fetch more results or transition to natural feed
         if (isSearchMode && !searchResultsExhausted) {
            dispatch(fetchNextSparksFromSearch())
         } else {
            // For natural feed mode: fetch more if on last spark and more available
            dispatch(fetchNextSparks())
         }
      }
   }, [
      dispatch,
      fetchNextError,
      fetchedCompanyWithCreatorStatus,
      hasNoMoreSparks,
      initialSparksFetched,
      isFetchingNextSparks,
      isOnLastSpark,
      isSearchMode,
      searchResultsExhausted,
      currentPlayingIndex,
      totalSparks,
   ])

   /**
    * To manage the creation of card notifications, and after they are displayed, ensure that the Sparks feed continues with its content
    */
   useEffect(() => {
      if (
         // eslint-disable-next-line no-extra-boolean-cast
         Boolean(!isFetchingNextSparks && hasNoMoreSparks && isOnLastSpark)
      ) {
         if (isGroupFeed) {
            if (activeSpark?.isCardNotification) {
               dispatch(removeGroupId())
               if (wasInCreatorFeed) {
                  dispatch(setFetchedCompanyWithCreatorStatus("finished"))
               }
               dispatch(fetchInitialSparksFeed())
            } else {
               const payload: AddCardNotificationPayload = {
                  type: SparkCardNotificationTypes.GROUP,
               }
               // Add a card notification to the Sparks array when a user reaches the end of the Company Sparks list
               dispatch(addCardNotificationToSparksList(payload))
            }
         } else if (isCreatorFeed) {
            if (activeSpark?.isCardNotification) {
               dispatch(setGroupId(activeSpark.creator.groupId))
               dispatch(fetchInitialSparksFeed())
               dispatch(removeCreatorId())
               dispatch(setFetchedCompanyWithCreatorStatus("ongoing"))
            } else {
               const payload: AddCardNotificationPayload = {
                  type: SparkCardNotificationTypes.CREATOR,
               }
               dispatch(addCardNotificationToSparksList(payload))
            }
         } else if (isInCreatorFeed) {
            dispatch(removeGroupId())
            dispatch(setFetchedCompanyWithCreatorStatus("finished"))
            dispatch(fetchNextSparks())
         }
      }
   }, [
      activeSpark?.isCardNotification,
      dispatch,
      isFromGroupPage,
      hasNoMoreSparks,
      isFetchingNextSparks,
      isOnLastSpark,
      activeSpark?.creator?.id,
      activeSpark?.creator?.groupId,
      fetchedCompanyWithCreatorStatus,
      isGroupFeed,
      isCreatorFeed,
      isInCreatorFeed,
      wasInCreatorFeed,
   ])

   useEffect(() => {
      if (fetchNextError) {
         enqueueSnackbar("Error fetching next sparks. Click here to retry.", {
            variant: "error",
            action: (key) => (
               <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                     dispatch(fetchNextSparks())
                     closeSnackbar(key)
                  }}
               >
                  Retry
               </Button>
            ),
         })
      }
   }, [closeSnackbar, dispatch, enqueueSnackbar, fetchNextError])

   const sparkForSeo = useMemo(() => {
      const serverSideSpark = SparkPresenter.deserialize(serializedSpark)
      return activeSpark ?? serverSideSpark
   }, [activeSpark, serializedSpark])

   /**
    * This effect is used to update the URL when the active spark changes.
    * - We use the `replace` method to avoid adding a new entry to the history stack,
    *   allowing the user to use the back button to go back to the page before the sparks page.
    * - We use the `shallow` option to avoid re-rendering the page.
    * - In search mode, we preserve only search-related query parameters to maintain search state.
    */
   useEffect(() => {
      const currentSparkId = query.sparkId
      const newSparkId = sparkForSeo?.id

      if (newSparkId && currentSparkId !== newSparkId) {
         // Only preserve search-related parameters
         const searchParamKeys = [
            "q",
            "languages",
            "contentTopics",
            "companySizes",
            "industries",
         ]
         const newUrl = appendCurrentQueryParams(
            `/sparks/${newSparkId}`,
            [],
            searchParamKeys
         )

         replace(newUrl, undefined, {
            shallow: true,
         })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [sparkForSeo?.id])

   return (
      <Fragment>
         {mounted() ? (
            <GenericDashboardLayout
               hideDrawer={isFullScreen}
               hideFooter
               headerWidth="auto"
               hideHeader={isFullScreen}
               isBottomNavDark={isFullScreen}
               headerType="fixed"
            >
               <SparksFeedCarousel />
            </GenericDashboardLayout>
         ) : null}
         <SparkSeo spark={sparkForSeo} />
      </Fragment>
   )
}

type SparksPageProps = {
   serializedSpark: SerializedSpark
   groupId: string | null
   userEmail: string | null
   conversionInterval: number
   interactionSource: string | null
   contentTopic: string
}

export const getServerSideProps: GetServerSideProps<
   SparksPageProps,
   {
      // next params go here
      sparkId: string
   }
> = async (context) => {
   const groupId = context.query.groupId
      ? context.query.groupId.toString()
      : null

   const conversionInterval = context.query.conversionInterval
      ? context.query.conversionInterval.toString()
      : null

   const interactionSource = context.query.interactionSource
      ? context.query.interactionSource.toString()
      : null

   const contentTopic = context.query.contentTopic
      ? context.query.contentTopic.toString()
      : null

   const token = getUserTokenFromCookie(context)

   const sparkId = context.params.sparkId

   const sparkFromService = await sparkService.getSparkById(sparkId)

   if (!sparkFromService) {
      return {
         redirect: {
            destination: `/sparks`,
            permanent: false,
         },
      }
   }

   return {
      props: {
         serializedSpark: SparkPresenter.serialize(sparkFromService),
         groupId,
         userEmail: token?.email ?? null,
         conversionInterval: +conversionInterval,
         interactionSource,
         contentTopic: contentTopic,
      },
   }
}

export default SparksPage

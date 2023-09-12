import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Button } from "@mui/material"
import SparkSeo from "components/views/sparks/components/SparkSeo"
import { sparkService } from "data/firebase/SparksService"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import SparksFeedCarousel from "components/views/sparks-feed/SparksFeedCarousel"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   fetchInitialSparksFeed,
   fetchNextSparks,
   resetSparksFeed,
   setCurrentEventNotification,
   setGroupId,
   setSparks,
   setUserEmail,
} from "store/reducers/sparksFeedReducer"
import {
   activeSparkSelector,
   currentSparkIndexSelector,
   fetchNextErrorSelector,
   hasNoMoreSparksSelector,
   initialSparksFetchedSelector,
   isFetchingNextSparksSelector,
   isOnLastSparkSelector,
   sparksSelector,
} from "store/selectors/sparksFeedSelectors"
import { getUserTokenFromCookie } from "util/serverUtil"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import useUserSparksNotifications from "../../components/custom-hook/spark/useUserSparksNotifications"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import SparksFeedEventTrackerProvider from "context/spark/SparksFeedEventTrackerProvider"

const SparksPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serializedSpark, groupId, userEmail }) => {
   const isFullScreen = useSparksFeedIsFullScreen()

   const { closeSnackbar, enqueueSnackbar } = useSnackbar()
   const dispatch = useDispatch()
   const { replace, query } = useRouter()

   const isOnLastSpark = useSelector(isOnLastSparkSelector)
   const isFetchingNextSparks = useSelector(isFetchingNextSparksSelector)
   const hasNoMoreSparks = useSelector(hasNoMoreSparksSelector)
   const initalSparksFetched = useSelector(initialSparksFetchedSelector)
   const activeSpark = useSelector(activeSparkSelector)
   const fetchNextError = useSelector(fetchNextErrorSelector)
   const { data: eventNotifications } = useUserSparksNotifications(
      userEmail,
      groupId
   )
   const currentPlayingIndex = useSelector(currentSparkIndexSelector)
   const sparks = useSelector(sparksSelector)

   useEffect(() => {
      dispatch(setGroupId(groupId))
      dispatch(setUserEmail(userEmail))

      dispatch(setSparks([SparkPresenter.deserialize(serializedSpark)]))
   }, [dispatch, groupId, serializedSpark, userEmail])

   useEffect(() => {
      dispatch(fetchInitialSparksFeed())

      return () => {
         dispatch(resetSparksFeed())
      }
   }, [dispatch])

   useEffect(() => {
      if (
         initalSparksFetched &&
         isOnLastSpark &&
         !isFetchingNextSparks &&
         !hasNoMoreSparks &&
         !fetchNextError
      ) {
         dispatch(fetchNextSparks())
      }
   }, [
      dispatch,
      fetchNextError,
      hasNoMoreSparks,
      initalSparksFetched,
      isFetchingNextSparks,
      isOnLastSpark,
   ])

   useEffect(() => {
      let timeout: NodeJS.Timeout

      if (eventNotifications?.length) {
         timeout = setTimeout(() => {
            dispatch(
               setCurrentEventNotification(
                  eventNotifications[0] as UserSparksNotification
               )
            )
         }, SPARK_CONSTANTS.SECONDS_TO_SHOW_EVENT_NOTIFICATION)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [currentPlayingIndex, dispatch, eventNotifications, sparks])

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
    */
   useEffect(() => {
      const currentSparkId = query.sparkId
      const newSparkId = sparkForSeo?.id

      if (newSparkId && currentSparkId !== newSparkId) {
         replace(`/sparks/${newSparkId}`, undefined, {
            shallow: true,
         })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [sparkForSeo?.id])

   return (
      <SparksFeedEventTrackerProvider
         originalSparkId={serializedSpark?.id || null}
      >
         <GenericDashboardLayout
            hideDrawer={isFullScreen}
            topBarFixed
            topBarTransparent
            hideFooter
            headerWidth="auto"
         >
            <SparksFeedCarousel />
         </GenericDashboardLayout>
         <SparkSeo spark={sparkForSeo} />
      </SparksFeedEventTrackerProvider>
   )
}

type SparksPageProps = {
   serializedSpark: SerializedSpark
   groupId: string | null
   userEmail: string | null
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

   const token = getUserTokenFromCookie(context)

   const sparkId = context.params.sparkId

   const sparkFromService = await sparkService.getSparkById(sparkId)

   if (!sparkFromService) {
      return {
         notFound: true,
      }
   }

   return {
      props: {
         serializedSpark: SparkPresenter.serialize(sparkFromService),
         groupId,
         userEmail: token?.email ?? null,
      },
   }
}

export default SparksPage

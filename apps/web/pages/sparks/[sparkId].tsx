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
import { Fragment, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   addCarNotificationToSparksList,
   fetchInitialSparksFeed,
   fetchNextSparks,
   removeGroupId,
   resetSparksFeed,
   setGroupId,
   setOriginalSparkId,
   setSparks,
   setUserEmail,
} from "store/reducers/sparksFeedReducer"
import {
   activeSparkSelector,
   fetchNextErrorSelector,
   groupIdSelector,
   hasNoMoreSparksSelector,
   initialSparksFetchedSelector,
   isFetchingNextSparksSelector,
   isOnLastSparkSelector,
} from "store/selectors/sparksFeedSelectors"
import { getUserTokenFromCookie } from "util/serverUtil"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import { isInPreviewOrDevelopmentEnvironment } from "util/CommonUtil"

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
   const initialSparksFetched = useSelector(initialSparksFetchedSelector)
   const activeSpark = useSelector(activeSparkSelector)
   const fetchNextError = useSelector(fetchNextErrorSelector)
   const fromGroupPage = useSelector(groupIdSelector)

   useEffect(() => {
      dispatch(setGroupId(groupId))
      dispatch(setUserEmail(userEmail))

      const originalSpark = SparkPresenter.deserialize(serializedSpark)
      dispatch(setSparks([originalSpark]))
      dispatch(setOriginalSparkId(originalSpark.id))
   }, [dispatch, groupId, serializedSpark, userEmail])

   useEffect(() => {
      dispatch(fetchInitialSparksFeed())

      return () => {
         dispatch(resetSparksFeed())
      }
   }, [dispatch])

   useEffect(() => {
      if (
         initialSparksFetched &&
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
      initialSparksFetched,
      isFetchingNextSparks,
      isOnLastSpark,
   ])

   /**
    * To manage the creation of card notifications, and after they are displayed, ensure that the Sparks feed continues with its content
    */
   useEffect(() => {
      if (
         Boolean(
            !isFetchingNextSparks &&
               hasNoMoreSparks &&
               isOnLastSpark &&
               fromGroupPage
         )
      ) {
         if (activeSpark?.isCardNotification) {
            dispatch(removeGroupId())
            dispatch(fetchInitialSparksFeed())
         } else {
            // Add a card notification to the Sparks array when a user reaches the end of the Company Sparks list
            dispatch(addCarNotificationToSparksList())
         }
      }
   }, [
      activeSpark?.isCardNotification,
      dispatch,
      fromGroupPage,
      hasNoMoreSparks,
      isFetchingNextSparks,
      isOnLastSpark,
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
      <Fragment>
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
      </Fragment>
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
   // TODO: remove this when we are ready to launch
   if (!isInPreviewOrDevelopmentEnvironment()) {
      return {
         redirect: {
            destination: "/portal",
            permanent: false,
         },
      }
   }

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

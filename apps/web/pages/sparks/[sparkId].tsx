import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Box, Button, Card, Stack, Typography } from "@mui/material"
import SparkSeo from "components/views/sparks/components/SparkSeo"
import { sparkService } from "data/firebase/SparksService"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   fetchInitialSparksFeed,
   fetchNextSparks,
   resetSparksFeed,
   setGroupId,
   setSparks,
   setUserEmail,
   swipeNextSpark,
   swipePreviousSpark,
} from "store/reducers/sparksFeedReducer"
import {
   activeSparkSelector,
   currentSparkIndexSelector,
   fetchNextErrorSelector,
   hasNoMoreSparksSelector,
   initialSparksFetchedSelector,
   isFetchingInitialSparksSelector,
   isFetchingNextSparksSelector,
   isOnLastSparkSelector,
   numberOfSparksToFetchSelector,
   totalNumberOfSparksSelector,
} from "store/selectors/sparksFeedSelectors"
import { getUserTokenFromCookie } from "util/serverUtil"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const SparksPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serializedSpark, groupId, userEmail }) => {
   const { closeSnackbar, enqueueSnackbar } = useSnackbar()
   const dispatch = useDispatch()
   const { replace } = useRouter()

   const isOnLastSpark = useSelector(isOnLastSparkSelector)
   const isFetchingNextSparks = useSelector(isFetchingNextSparksSelector)
   const isFetchingInitialSparks = useSelector(isFetchingInitialSparksSelector)
   const hasNoMoreSparks = useSelector(hasNoMoreSparksSelector)
   const initalSparksFetched = useSelector(initialSparksFetchedSelector)
   const totalNumberOfSparks = useSelector(totalNumberOfSparksSelector)
   const activeSpark = useSelector(activeSparkSelector)
   const curentIndex = useSelector(currentSparkIndexSelector)
   const numberOfSparksToFetch = useSelector(numberOfSparksToFetchSelector)
   const fetchNextError = useSelector(fetchNextErrorSelector)

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

   /**
    * This effect is used to update the URL when the active spark changes.
    * - We use the `replace` method to avoid adding a new entry to the history stack,
    *   allowing the user to use the back button to go back to the page before the sparks page.
    * - We use the `shallow` option to avoid re-rendering the page.
    */
   useEffect(() => {
      if (activeSpark?.id) {
         replace(`/sparks/${activeSpark.id}`, undefined, { shallow: true })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeSpark?.id])

   const sparkForSeo = useMemo(() => {
      const serverSideSpark = SparkPresenter.deserialize(serializedSpark)
      return activeSpark ?? serverSideSpark
   }, [activeSpark, serializedSpark])

   return (
      <GenericDashboardLayout topBarFixed topBarTransparent>
         <Box>
            <Typography>
               Spark: {curentIndex + 1} / {totalNumberOfSparks}
            </Typography>
            {activeSpark ? (
               <Card>
                  <Box>{activeSpark?.question}</Box>
                  <Box>{activeSpark?.id}</Box>
               </Card>
            ) : null}
            {isFetchingNextSparks ? (
               <Typography>
                  Fetching another {numberOfSparksToFetch} sparks...
               </Typography>
            ) : null}
            {isFetchingInitialSparks ? (
               <Typography>Fetching initial feed...</Typography>
            ) : null}
            {hasNoMoreSparks ? (
               <Typography>There are no more sparks to fetch.</Typography>
            ) : null}
            <Stack direction="row">
               <Button onClick={() => dispatch(swipePreviousSpark())}>
                  Prev Slide
               </Button>
               <Button onClick={() => dispatch(swipeNextSpark())}>
                  Next Slide
               </Button>
            </Stack>
            <SparkSeo spark={sparkForSeo} />
         </Box>
      </GenericDashboardLayout>
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

   const sparkFromService = await sparkService.getSparkById(sparkId) // This is a method you'd need to implement

   return {
      props: {
         serializedSpark: SparkPresenter.serialize(sparkFromService),
         groupId,
         userEmail: token?.email ?? null,
      },
   }
}

export default SparksPage

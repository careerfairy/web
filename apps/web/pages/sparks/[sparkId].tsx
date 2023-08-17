import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Box, Button, Card, Stack, Typography } from "@mui/material"
import { sparkService } from "data/firebase/SparksService"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   fetchInitialSparksFeed,
   fetchNextSparks,
   setGroupId,
   setSparks,
   setUserEmail,
   swipeNextSpark,
   swipePreviousSpark,
} from "store/reducers/sparksFeedReducer"
import {
   activeSparkSelector,
   currentSparkIndexSelector,
   hasNoMoreSparksSelector,
   initialSparksFetchedSelector,
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
   const dispatch = useDispatch()
   const isOnLastSpark = useSelector(isOnLastSparkSelector)
   const isFetchingNextSparks = useSelector(isFetchingNextSparksSelector)
   const hasNoMoreSparks = useSelector(hasNoMoreSparksSelector)
   const initalSparksFetched = useSelector(initialSparksFetchedSelector)
   const totalNumberOfSparks = useSelector(totalNumberOfSparksSelector)
   const activeSpark = useSelector(activeSparkSelector)
   const curentIndex = useSelector(currentSparkIndexSelector)
   const numberOfSparksToFetch = useSelector(numberOfSparksToFetchSelector)

   // Store initial sparks in Redux store upon page mount
   useEffect(() => {
      dispatch(setGroupId(groupId))
      dispatch(setUserEmail(userEmail))

      dispatch(setSparks([SparkPresenter.deserialize(serializedSpark)]))

      return () => {
         dispatch(setSparks([]))
         dispatch(setGroupId(null))
         dispatch(setUserEmail(null))
      }
   }, [dispatch, groupId, serializedSpark, userEmail])

   useEffect(() => {
      dispatch(fetchInitialSparksFeed())
   }, [dispatch])

   useEffect(() => {
      if (
         initalSparksFetched &&
         isOnLastSpark &&
         !isFetchingNextSparks &&
         !hasNoMoreSparks
      ) {
         dispatch(fetchNextSparks())
      }
   }, [
      dispatch,
      hasNoMoreSparks,
      initalSparksFetched,
      isFetchingNextSparks,
      isOnLastSpark,
   ])

   return (
      <GenericDashboardLayout pageDisplayName={""}>
         <Box>
            <Stack direction="row">
               <Button onClick={() => dispatch(swipePreviousSpark())}>
                  Prev Slide
               </Button>
               <Button onClick={() => dispatch(swipeNextSpark())}>
                  Next Slide
               </Button>
            </Stack>
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
                  Fetching next {numberOfSparksToFetch} sparks...
               </Typography>
            ) : null}
            {hasNoMoreSparks ? (
               <Typography>There are no more sparks to fetch.</Typography>
            ) : null}
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

import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Box } from "@mui/material"
import { sparkService } from "data/firebase/SparksService"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   fetchNextSparks,
   setGroupId,
   setSparks,
} from "store/reducers/sparksFeedReducer"
import {
   hasNoMoreSparksSelector,
   isFetchingNextSparksSelector,
   isOnLastSparkSelector,
} from "store/selectors/sparksFeedSelectors"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const SparksPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serializedSpark, groupId }) => {
   const dispatch = useDispatch()
   const isOnLastSpark = useSelector(isOnLastSparkSelector)
   const isFetchingNextSparks = useSelector(isFetchingNextSparksSelector)
   const hasNoMoreSparks = useSelector(hasNoMoreSparksSelector)

   // Store initial sparks in Redux store upon page mount
   useEffect(() => {
      dispatch(setGroupId(groupId))

      dispatch(
         setSparks([SparkPresenter.createFromPlainObject(serializedSpark)])
      )
   }, [dispatch, groupId, serializedSpark])

   useEffect(() => {
      if (isOnLastSpark && !isFetchingNextSparks && !hasNoMoreSparks) {
         dispatch(fetchNextSparks())
      }
   }, [dispatch, hasNoMoreSparks, isFetchingNextSparks, isOnLastSpark])

   return (
      <GenericDashboardLayout pageDisplayName={""}>
         <Box></Box>
      </GenericDashboardLayout>
   )
}

type SparksPageProps = {
   serializedSpark: SerializedSpark
   groupId: string | null
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

   const sparkId = context.params.sparkId

   const sparkFromService = await sparkService.getSparkById(sparkId) // This is a method you'd need to implement

   return {
      props: {
         serializedSpark: SparkPresenter.serialize(sparkFromService),
         groupId,
      },
   }
}

export default SparksPage

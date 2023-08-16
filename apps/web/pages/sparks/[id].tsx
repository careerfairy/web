import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Box } from "@mui/material"
import { sparkService } from "data/firebase/SparksService"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import {
   setCurrentOptions,
   setInitialSparks,
} from "store/reducers/sparksFeedReducer"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const SparksPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ initialSparks, groupId }) => {
   const dispatch = useDispatch()

   console.table(initialSparks.map((s) => s.id))

   // Store initial sparks in Redux store upon page mount
   useEffect(() => {
      dispatch(
         setCurrentOptions({
            groupId,
         })
      )

      dispatch(
         setInitialSparks(
            initialSparks.map(SparkPresenter.createFromPlainObject)
         )
      )
   }, [dispatch, groupId, initialSparks])

   return (
      <GenericDashboardLayout pageDisplayName={""}>
         <Box></Box>
      </GenericDashboardLayout>
   )
}

type SparksPageProps = {
   initialSparks: SerializedSpark[] // Replace `Spark` with the type of your spark
   groupId: string | null
}

export const getServerSideProps: GetServerSideProps<
   SparksPageProps,
   {
      // next params go here
      id: string
   }
> = async (context) => {
   const groupId = context.query.groupId
      ? context.query.groupId.toString()
      : null

   const sparkId = context.params.id

   const sparkFromService = await sparkService.getSparkById(sparkId) // This is a method you'd need to implement
   console.log(
      "🚀 ~ file: [id].tsx:64 ~ >= ~ sparkFromService:",
      sparkFromService.id
   )

   const sparksFromService = await sparkService.fetchNextSparks(
      sparkFromService,
      {
         groupId,
      }
   ) // Fetch the first batch.

   const initialSparks = [sparkFromService, ...sparksFromService].map(
      SparkPresenter.toPlainObject
   )

   return {
      props: {
         initialSparks,
         groupId,
      },
   }
}

export default SparksPage

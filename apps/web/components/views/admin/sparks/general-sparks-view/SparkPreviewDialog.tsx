import Dialog from "@mui/material/Dialog"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupSpark from "components/custom-hook/spark/useGroupSpark"
import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setSparkToPreview } from "store/reducers/adminSparksReducer"
import { sparkToPreviewSelector } from "store/selectors/adminSparksSelectors"

const SparkPreviewDialog: FC = () => {
   const dispatch = useDispatch()
   const sparkId = useSelector(sparkToPreviewSelector)

   const open = Boolean(sparkId)

   const handleClose = useCallback(() => {
      dispatch(setSparkToPreview(null))
   }, [dispatch])

   return (
      <Dialog onClose={handleClose} open={open}>
         <SuspenseWithBoundary fallback={<SparkCarouselCardSkeleton />}>
            {sparkId ? (
               <Component sparkId={sparkId} />
            ) : (
               <SparkCarouselCardSkeleton />
            )}
         </SuspenseWithBoundary>
      </Dialog>
   )
}

type Props = {
   sparkId: string
}

const Component: FC<Props> = ({ sparkId }) => {
   const { group } = useGroup()

   const spark = useGroupSpark(group.id, sparkId)

   return <div>{spark?.question}</div>
}

export default SparkPreviewDialog

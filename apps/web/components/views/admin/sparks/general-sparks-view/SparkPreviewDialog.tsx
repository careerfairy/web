import CloseIcon from "@mui/icons-material/Close"
import { Box, IconButton } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupSpark from "components/custom-hook/spark/useGroupSpark"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import SparkCarouselCard from "components/views/sparks/components/spark-card/SparkCarouselCard"
import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setSparkToPreview } from "store/reducers/adminSparksReducer"
import { sparkToPreviewSelector } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   aspectRoot: {
      width: {
         xs: 300,
         md: 400,
      },
   },
   root: {
      position: "relative",
      pt: 4,
   },
   closeButton: {
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 1,
      color: "white",
   },
   dialogPaper: {
      backgroundColor: "transparent",
   },
})

const SparkPreviewDialog: FC = () => {
   const dispatch = useDispatch()
   const sparkId = useSelector(sparkToPreviewSelector)

   const open = Boolean(sparkId)

   const handleClose = useCallback(() => {
      dispatch(setSparkToPreview(null))
   }, [dispatch])

   return (
      <Dialog
         PaperProps={{
            sx: styles.dialogPaper,
         }}
         onClose={handleClose}
         open={open}
      >
         <SuspenseWithBoundary fallback={<SparkCarouselCardSkeleton />}>
            {sparkId ? (
               <Component onClose={handleClose} sparkId={sparkId} />
            ) : (
               <SparkCarouselCardSkeleton />
            )}
         </SuspenseWithBoundary>
      </Dialog>
   )
}

type Props = {
   sparkId: string
   onClose: () => void
}

const Component: FC<Props> = ({ sparkId, onClose }) => {
   const { group } = useGroup()

   const spark = useGroupSpark(group.id, sparkId)

   return (
      <Box sx={styles.root}>
         <IconButton
            aria-label="close"
            onClick={onClose}
            sx={styles.closeButton}
         >
            <CloseIcon />
         </IconButton>
         <SparkAspectRatioBox sx={styles.aspectRoot}>
            <SparkCarouselCard preview={false} spark={spark} />
         </SparkAspectRatioBox>
      </Box>
   )
}

export default SparkPreviewDialog

import CloseIcon from "@mui/icons-material/Close"
import { Box, IconButton, Zoom } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupSpark from "components/custom-hook/spark/useGroupSpark"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import SparkCarouselCardForAdmin from "components/views/sparks/components/spark-card/SparkCarouselCardForAdmin"
import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setSparkToPreview } from "store/reducers/adminSparksReducer"
import { sparkToPreviewSelector } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import SparkSkeletonComponent from "./SparkSkeletonComponent"

const styles = sxStyles({
   aspectRoot: {
      width: {
         xs: 300,
         md: 400,
      },
   },
   closeButton: {
      position: "absolute",
      display: "flex",
      right: -35,
      top: -35,
      zIndex: 1,
      color: "white",
   },
   dialogPaper: {
      overflowY: "unset",
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
         TransitionComponent={Zoom}
      >
         <SuspenseWithBoundary
            fallback={<SparkSkeletonComponent sx={styles.aspectRoot} />}
         >
            {sparkId ? (
               <Component onClose={handleClose} sparkId={sparkId} />
            ) : (
               <SparkSkeletonComponent sx={styles.aspectRoot} />
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
      <>
         <IconButton
            sx={styles.closeButton}
            aria-label="close"
            color="inherit"
            onClick={onClose}
         >
            <CloseIcon fontSize="large" />
         </IconButton>
         <Box>
            <SparkAspectRatioBox sx={styles.aspectRoot}>
               <SparkCarouselCardForAdmin preview={false} spark={spark} />
            </SparkAspectRatioBox>
         </Box>
      </>
   )
}

const SkeletonComponent: FC = () => {
   return (
      <SparkAspectRatioBox sx={styles.aspectRoot}>
         <SparkCarouselCardSkeleton />
      </SparkAspectRatioBox>
   )
}

export default SparkPreviewDialog

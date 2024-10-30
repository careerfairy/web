import CloseIcon from "@mui/icons-material/Close"
import { Box, IconButton, Zoom } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupSpark from "components/custom-hook/spark/useGroupSpark"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import SparkPreviewCardForAdmin from "components/views/sparks/components/spark-card/SparkPreviewCardForAdmin"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback, useEffect, useState } from "react"
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
            ) : null}
         </SuspenseWithBoundary>
      </Dialog>
   )
}

type Props = {
   sparkId: string
   onClose: () => void
}

const Component: FC<Props> = ({ sparkId, onClose }) => {
   // To prevent show/playing the video when the component unmounts
   const [showContent, setShowContent] = useState(false)

   const { group } = useGroup()
   const spark = useGroupSpark(group.id, sparkId)

   useEffect(() => {
      setShowContent(true)

      return () => {
         setShowContent(false)
      }
   }, [])

   return showContent ? (
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
               <SparkPreviewCardForAdmin
                  type="fullScreen"
                  preview={false}
                  spark={spark}
               />
            </SparkAspectRatioBox>
         </Box>
      </>
   ) : null
}

export default SparkPreviewDialog

import { memo, useEffect, useState } from "react"
import { pdfjs } from "react-pdf"
import { Document, Page } from "react-pdf"

import { useWindowSize } from "components/custom-hook/useWindowSize"
import {
   Button,
   CircularProgress,
   Dialog,
   DialogContent,
   IconButton,
   LinearProgress,
} from "@mui/material"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"

import FilePickerContainer from "components/ssr/FilePickerContainer"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import Box from "@mui/material/Box"
import AutoSizer from "react-virtualized-auto-sizer"
import makeStyles from "@mui/styles/makeStyles"
import { STREAM_ELEMENT_BORDER_RADIUS } from "constants/streams"

const useStyles = makeStyles((theme) => ({
   root: {},
   pdfWrapper: {
      borderRadius: STREAM_ELEMENT_BORDER_RADIUS,
      backgroundColor: theme.palette.common.black,
      boxShadow: theme.shadows[5],
      position: "absolute",
      top: "0",
      left: "50%",
      transform: "translate(-50%)",
      display: ({ pdfObject }) => (pdfObject ? "flex" : "none"),
      overflow: "hidden",
      width: "100%",
      justifyContent: "center",
   },
}))
const LivestreamPdfViewer = ({ livestreamId, presenter, showMenu }) => {
   const firebase = useFirebaseService()
   pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

   const windowSize = useWindowSize()
   const [pdfObject, setPdfObject] = useState(null)
   const [loading, setLoading] = useState(true)

   const [goingToPreviousPage, setGoingToPreviousPage] = useState(false)
   const [goingToNextPage, setGoingToNextPage] = useState(false)

   const [pdfNumberOfPages, setPdfNumberOfPages] = useState(1)

   const [uploadingPresentation, setUploadingPresentation] = useState(false)
   const [progress, setProgress] = useState(0)
   const classes = useStyles({ pdfObject })

   useEffect(() => {
      if (livestreamId) {
         setLoading(true)
         firebase.listenToLivestreamPresentation(
            livestreamId,
            (querySnapshot) => {
               if (querySnapshot.exists) {
                  setPdfObject(querySnapshot.data())
               } else {
                  setLoading(false)
               }
            }
         )
      }
   }, [livestreamId])

   function uploadLogo(logoFile) {
      setLoading(true)
      setUploadingPresentation(true)
      var storageRef = firebase.getStorageRef()
      let presentationRef = storageRef.child(
         "company_documents/" + livestreamId + ".pdf"
      )

      var uploadTask = presentationRef.put(logoFile)

      uploadTask.on(
         "state_changed",
         function (snapshot) {
            var progress =
               (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setProgress(progress)
            console.log("Upload is " + progress + "% done")
            switch (snapshot.state) {
               case "paused":
                  console.log("Upload is paused")
                  break
               case "running":
                  console.log("Upload is running")
                  break
               default:
                  break
            }
         },
         function (error) {
            switch (error.code) {
               case "storage/unauthorized":
                  break
               case "storage/canceled":
                  break
               case "storage/unknown":
                  break
               default:
                  break
            }
         },
         function () {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref
               .getDownloadURL()
               .then(function (downloadURL) {
                  firebase.setLivestreamPresentation(livestreamId, downloadURL)
                  console.log("File available at", downloadURL)
                  setUploadingPresentation(false)
               })
         }
      )
   }

   function getPageHeight(height, width) {
      if (showMenu) {
         if (windowSize.height > windowSize.width - 480) {
            return windowSize.width * 0.4
         }
         return height
      } else {
         if (windowSize.height > windowSize.width - 220) {
            return windowSize.width * 0.55
         }
         return height
      }
   }

   function increasePdfPageNumber() {
      setGoingToNextPage(true)
      firebase
         .increaseLivestreamPresentationPageNumber(livestreamId, 1)
         .then(() => {
            setGoingToNextPage(false)
         })
   }

   function decreasePdfPageNumber() {
      setGoingToPreviousPage(true)
      firebase
         .increaseLivestreamPresentationPageNumber(livestreamId, -1)
         .then(() => {
            setGoingToPreviousPage(false)
         })
   }

   const loader = (
      <CircularProgress style={{ maxWidth: "30px", height: "auto" }} />
   )

   const nav = (
      <Box>
         <IconButton
            size="small"
            variant="contained"
            disabled={
               goingToNextPage ||
               goingToPreviousPage ||
               (pdfObject ? pdfObject.page === 1 : false)
            }
            onClick={() => decreasePdfPageNumber()}
         >
            {goingToPreviousPage ? (
               <CircularProgress size={20} color="inherit" />
            ) : (
               <KeyboardArrowLeftIcon fontSize="large" />
            )}
         </IconButton>
         <IconButton
            variant="contained"
            size="small"
            disabled={
               goingToNextPage ||
               goingToPreviousPage ||
               (pdfObject ? pdfObject.page === pdfNumberOfPages : false)
            }
            onClick={() => increasePdfPageNumber()}
         >
            {goingToNextPage ? (
               <CircularProgress size={20} color="inherit" />
            ) : (
               <KeyboardArrowRightIcon fontSize="large" />
            )}
         </IconButton>
      </Box>
   )

   const picker = (
      <FilePickerContainer
         extensions={["pdf"]}
         onChange={(fileObject) => {
            uploadLogo(fileObject)
         }}
         maxSize={20}
         onError={(errMsg) => console.log(errMsg)}
      >
         <Button color="primary" variant="contained" size="small">
            Upload Slides [.pdf]
         </Button>
      </FilePickerContainer>
   )

   const page = (height, width) => (
      <Document
         onLoadSuccess={({ numPages }) => {
            setPdfNumberOfPages(numPages)
            setLoading(false)
         }}
         file={pdfObject ? pdfObject.downloadUrl : ""}
      >
         <Page
            height={getPageHeight(height, width)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            pageNumber={pdfObject ? pdfObject.page : 1}
         />
      </Document>
   )

   const emptyPage = (
      <div style={{ color: "white", marginBottom: "40px" }}>
         <p>You currently have no slides to share</p>
         <div>
            <FilePickerContainer
               extensions={["pdf"]}
               onChange={(fileObject) => {
                  uploadLogo(fileObject)
               }}
               maxSize={20}
               onError={(errMsg) => console.log(errMsg)}
            >
               <Button color="primary" variant="contained">
                  Upload Slides [.pdf]
               </Button>
            </FilePickerContainer>
         </div>
      </div>
   )

   const waitingOverlay = (
      <div style={{ color: "white", marginBottom: "40px" }}>
         Please wait for the presenter to upload slides.
      </div>
   )

   return (
      <AutoSizer>
         {({ height, width }) => (
            <Box
               height={height}
               width={width}
               display="flex"
               justifyContent="center"
               alignItems="center"
               className={classes.root}
            >
               <div
                  style={{
                     display: loading ? "block" : "none",
                     position: "relative",
                     width: "100%",
                     height: "100%",
                  }}
               >
                  <div
                     style={{
                        position: "absolute",
                        width: "30%",
                        maxWidth: "30px",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                     }}
                  >
                     {loader}
                  </div>
               </div>
               <div
                  style={{
                     display: loading ? "none" : "flex",
                     position: "relative",
                     width: "100%",
                     height: "100%",
                     justifyContent: "center",
                     alignItems: "center",
                  }}
               >
                  <div className={classes.pdfWrapper}>
                     <div
                        style={{
                           position: "absolute",
                           bottom: "0",
                           left: "0",
                           zIndex: "1000",
                           width: "100%",
                           padding: "25px",
                           display: presenter ? "block" : "none",
                           backgroundColor: "rgba(110,110,110, 0.8)",
                        }}
                     >
                        <div
                           style={{
                              display: "inline-block",
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                           }}
                        >
                           {nav}
                        </div>
                     </div>
                     <div
                        style={{
                           position: "absolute",
                           top: "10px",
                           right: "10px",
                           zIndex: "1000",
                           display: presenter ? "block" : "none",
                        }}
                     >
                        {picker}
                     </div>
                     <div style={{ position: "relative", textAlign: "center" }}>
                        {page(height, width)}
                     </div>
                  </div>
                  <div
                     style={{
                        position: "absolute",
                        top: "150px",
                        left: "50%",
                        transform: "translate(-50%)",
                        display: pdfObject ? "none" : "block",
                     }}
                  >
                     <div style={{ marginBottom: "20px", zIndex: "9999" }}>
                        <div
                           style={{
                              textAlign: "center",
                              display: presenter ? "block" : "none",
                           }}
                        >
                           {emptyPage}
                        </div>
                        <div
                           style={{
                              textAlign: "center",
                              display: presenter ? "none" : "block",
                           }}
                        >
                           {waitingOverlay}
                        </div>
                     </div>
                  </div>
                  <Dialog open={uploadingPresentation}>
                     <DialogContent style={{ padding: 30 }}>
                        <h3>Uploading presentation...</h3>
                        <LinearProgress
                           variant="determinate"
                           value={progress}
                        />
                     </DialogContent>
                  </Dialog>
               </div>
            </Box>
         )}
      </AutoSizer>
   )
}

export default memo(LivestreamPdfViewer)

import { useState, useEffect } from "react"

import ReactPlayer from "react-player"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import YoutubePreviewer from "components/views/common/YoutubePreviewer"
import { Container, Dialog, DialogContent, Grid } from "@mui/material"

function CompanyWatchPage(props) {
   const [videos, setVideos] = useState([])
   const [currentVideoId, setCurrentVideoId] = useState(null)
   const [modalOpen, setModalOpen] = useState(false)

   useEffect(() => {
      props.firebase
         .getCompanyVideos(props.company.id)
         .then((querySnapshot) => {
            var positionList = []
            querySnapshot.forEach(
               (doc) => {
                  let company = doc.data()
                  positionList.push(company)
               },
               (error) => {
                  console.log(error)
               }
            )
            setVideos(positionList)
         })
   }, [props.company])

   function openVideo(youtubeId) {
      setCurrentVideoId(youtubeId)
      setModalOpen(true)
   }

   useEffect(() => {
      if (props.fullpageApi) {
         setTimeout(() => {
            props.fullpageApi.reBuild()
         }, 300)
      }
   }, [videos])

   let videoList = videos.map((video, index) => {
      return (
         <Grid item xs={12} sm={6} key={index}>
            <YoutubePreviewer
               video={video}
               showVideo={() => openVideo(video.youtubeId)}
            />
         </Grid>
      )
   })

   return (
      <div className="paddingContainer">
         <Container>
            <Grid container id="videoColumn">
               {videoList}
            </Grid>
            <Dialog
               id="main-video-container"
               open={modalOpen}
               onClose={() => setModalOpen(false)}
               maxWidth={"lg"}
               fullWidth={true}
            >
               <DialogContent>
                  <ReactPlayer
                     className="react-player"
                     width="100%"
                     height="510px"
                     controls={true}
                     url={"https://www.youtube.com/watch?v=" + currentVideoId}
                     playing={true}
                  />
               </DialogContent>
            </Dialog>
            <style jsx>{`
               #videoColumn {
                  margin-bottom: 50px;
                  position: relative;
               }

               #main-video-container .content {
                  padding: 0 !important;
               }
            `}</style>
         </Container>
      </div>
   )
}

export default withFirebase(CompanyWatchPage)

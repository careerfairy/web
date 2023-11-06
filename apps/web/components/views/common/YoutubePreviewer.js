import { Grid } from "@mui/material"

function YoutubePreviewer(props) {
   let thumbnailUrl =
      "https://i.ytimg.com/vi/" + props.video.youtubeId + "/sddefault.jpg"

   return (
      <div
         className="react-player-thumbnail-container"
         onClick={() => props.showVideo()}
      >
         <div className="react-player-thumbnail-container">
            <img className="react-player-thumbnail" src={thumbnailUrl} />
         </div>
         <div className="react-player-description-overlay">
            <Grid container>
               <Grid item xs={3}>
                  <img
                     // style={{ margin: "12px 10px 0 10px" }}
                     src={props.video.companyLogoUrl}
                     style={{ maxWidth: "100%", maxHeight: "100px" }}
                  />
               </Grid>
               <Grid item xs={9}>
                  <div className="react-player-description-title">
                     {props.video.title}
                  </div>
                  <div className="react-player-description-speaker">
                     {props.video.speaker}
                  </div>
               </Grid>
            </Grid>
         </div>
         <style jsx>{`
            .react-player-thumbnail-container {
               padding-top: 30px;
               position: relative;
               cursor: pointer;
            }

            .react-player-description-overlay {
               color: black;
               margin-bottom: 20px;
               text-align: left;
            }

            .react-player-description-title {
               margin: 10px 0 0 0;
               font-weight: 500;
               font-size: 1em;
            }

            .react-player-thumbnail-container {
               position: relative;
            }

            .react-player-thumbnail {
               -webkit-filter: grayscale(40%);
               filter: grayscale(40%);
            }

            .react-player-thumbnail:hover {
               box-shadow: 0 0 2px rgb(200, 200, 200);
               -webkit-filter: grayscale(0%);
               filter: grayscale(0%);
            }

            .react-player-description-subtitle {
               font-size: 0.7em;
            }

            .react-player-description-speaker {
               font-size: 0.9em;
            }

            .hidden {
               display: none !important;
            }

            #react-player-description-hiring {
               text-transform: uppercase;
               margin: 10px 15px 0 15px;
               font-weight: 400;
               font-size: 0.7em;
               color: rgb(160, 160, 160);
            }
         `}</style>
      </div>
   )
}

export default YoutubePreviewer

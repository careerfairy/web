import { Button, Typography } from "@mui/material"
import { useState } from "react"
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter"

function JobDescription(props) {
   const [jobPostingOpen, setJobPostingOpen] = useState(false)

   function openLink(url) {
      window.open(url, "_blank")
   }

   return (
      <div className="past-livestream-job">
         <div className="past-livestream-job-label">
            <BusinessCenterIcon />
            <span>Livestreamed Job Offer</span>
         </div>
         <Typography
            variant={"h3"}
            id="past-livestream-job-title"
            style={{
               fontSize: "1.5em",
               textAlign: "left",
               fontWeight: "700",
               color: "rgb(60,60,60)",
               marginTop: "10px",
            }}
         >
            {props.position.title}
         </Typography>
         <div className="past-livestream-job-content">
            <p
               className="past-livestream-job-description"
               style={
                  jobPostingOpen ? {} : { height: "60px", overflow: "hidden" }
               }
            >
               {props.position.description}
            </p>
         </div>
         <Button
            size="small"
            variant="outlined"
            onClick={() => setJobPostingOpen(!jobPostingOpen)}
         >
            {jobPostingOpen ? "Hide Details" : "See Details"}
         </Button>
         <Button
            size="small"
            color="primary"
            onClick={() => openLink(props.position.url)}
         >
            Apply Now
         </Button>
         <style jsx>{`
            .past-livestream-job-label {
               text-transform: uppercase;
               font-size: 0.8em;
               color: rgb(120, 120, 120);
               margin-bottom: 0;
               text-align: left;
            }

            .past-livestream-job-label span {
               margin-left: 5px;
            }

            .past-livestream-job-label i {
               margin-right: 100px;
            }

            .past-livestream-job {
               background-color: white;
               border-radius: 5px;
               padding: 20px;
               box-shadow: 0 0 10px rgb(220, 220, 220);
            }

            .past-livestream-job-description {
               text-align: left;
            }

            .past-livestream-link {
               text-align: left;
            }

            .past-livestream-job-content {
               position: relative;
               margin-bottom: 10px;
            }

            .past-livestream-job-content-mask {
               position: absolute;
               bottom: 0;
               height: 100%;
               width: 100%;
               background: linear-gradient(
                  0deg,
                  rgba(255, 255, 255, 1) 0%,
                  rgba(255, 255, 255, 0) 100%
               );
            }
         `}</style>
      </div>
   )
}

export default JobDescription

import React, { useEffect, useState } from "react"
import { Grid, TextField, Typography } from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"

const Step5Confirm = ({ audioSource, videoSource, devices, speakerSource }) => {
   const [labels, setLabels] = useState({
      speaker: "",
      microphone: "",
      camera: "",
   })

   const setLabelObj = (value, deviceList) => {
      const targetIndex = deviceList.findIndex(
         (device) => device.value === value
      )
      let label = ""
      if (deviceList[targetIndex]) {
         label = deviceList[targetIndex].text
      }
      return label
   }

   useEffect(() => {
      let labelsObj = { ...labels }
      if (
         audioSource &&
         devices &&
         devices.audioInputList &&
         devices.audioInputList.length
      ) {
         labelsObj.microphone = setLabelObj(audioSource, devices.audioInputList)
      }
      if (
         speakerSource &&
         devices &&
         devices.audioOutputList &&
         devices.audioOutputList.length
      ) {
         labelsObj.speaker = setLabelObj(speakerSource, devices.audioOutputList)
      }
      if (
         videoSource &&
         devices &&
         devices.videoDeviceList &&
         devices.videoDeviceList.length
      ) {
         labelsObj.camera = setLabelObj(videoSource, devices.videoDeviceList)
      }
      setLabels(labelsObj)
   }, [audioSource, videoSource, devices, speakerSource])

   return (
      <>
         <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <CheckCircleOutlineIcon
               color="primary"
               style={{
                  margin: "0 auto",
                  fontSize: "3em",
                  marginBottom: "0.2rem",
               }}
            />
            <Typography variant="h5" align="center">
               <b>You are ready to stream!</b>
            </Typography>
            <Typography variant="subtitle1" align="center">
               Your stream will go live once you press "Start Streaming".
            </Typography>
         </div>
         <Grid style={{ padding: "1rem 0" }} spacing={2} container>
            <Grid
               sm={12}
               xs={12}
               lg={12}
               xl={12}
               hidden={!labels.camera.length}
               item
            >
               <TextField
                  id="camera"
                  label="Camera"
                  fullWidth
                  disabled
                  size="small"
                  InputProps={{ readOnly: true }}
                  value={labels.camera}
                  variant="outlined"
               />
            </Grid>
            <Grid
               sm={12}
               xs={12}
               lg={12}
               xl={12}
               hidden={!labels.microphone.length}
               item
            >
               <TextField
                  id="microphone"
                  label="Microphone"
                  fullWidth
                  disabled
                  size="small"
                  InputProps={{ readOnly: true }}
                  value={labels.microphone}
                  variant="outlined"
               />
            </Grid>
            <Grid
               sm={12}
               xs={12}
               lg={12}
               xl={12}
               hidden={!labels.speaker.length}
               item
            >
               <TextField
                  id="speaker"
                  label="Speaker"
                  fullWidth
                  disabled
                  size="small"
                  InputProps={{ readOnly: true }}
                  value={labels.speaker}
                  variant="outlined"
               />
            </Grid>
         </Grid>
      </>
   )
}

export default Step5Confirm

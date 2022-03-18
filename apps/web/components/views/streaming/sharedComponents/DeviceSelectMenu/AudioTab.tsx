import React from "react"
import { Button, Stack, Typography } from "@mui/material"
import { useAudio } from "react-use"

import DeviceSelect, { DeviceSelectProps } from "../DeviceSelect"

interface AudioTabProps extends DeviceSelectProps {}

const AudioTab = (props: AudioTabProps) => {
   const [audio, state, controls] = useAudio({
      src: "https://www.kozco.com/tech/piano2-CoolEdit.mp3",
      autoPlay: false,
   })

   const toggle = async () => {
      if (state.playing) {
         controls.pause()
         controls.seek(0)
      } else {
         await controls.play()
      }
   }
   return (
      <Stack spacing={2}>
         <DeviceSelect {...props} />
         {!!props.devices.audioInputList.length && (
            <>
               <Button variant="outlined" onClick={toggle}>
                  {props.openModal && audio}
                  {state.playing ? "Stop playing" : "Play some music"}
               </Button>
               {state.playing && (
                  <Typography color="text.secondary">
                     If you cannot hear the music, try changing the speaker on
                     your computer or increase the volume on your device.
                  </Typography>
               )}
            </>
         )}
      </Stack>
   )
}

export default AudioTab

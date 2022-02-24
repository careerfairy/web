import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useAudio } from "components/custom-hook/useAudio";
import DeviceSelect from "../DeviceSelect";

const styles = {
   button: {
      marginTop: 10,
      marginBottom: 10,
   },
};

const AudioTab = ({
   devices,
   openModal,
   localStream,
   mediaControls,
   localMediaHandlers,
   displayableMediaStream,
}) => {
   const [playing, toggle, audio] = useAudio(
      "https://www.kozco.com/tech/piano2-CoolEdit.mp3"
   );

   return (
      <Stack spacing={2}>
         <DeviceSelect
            devices={devices}
            localStream={localStream}
            showSoundMeter={openModal}
            displayableMediaStream={displayableMediaStream}
            localMediaHandlers={localMediaHandlers}
            openModal={openModal}
            mediaControls={mediaControls}
            mediaDeviceType={"microphone"}
            selectTitle={"Select Microphone"}
         />
         {!!devices.audioOutputList.length && (
            <Box>
               <Button
                  variant="outlined"
                  onClick={toggle}
                  className={styles.button}
               >
                  {playing ? "Stop playing" : "Play some music"}
               </Button>
               {playing && (
                  <Typography>
                     If you cannot hear the music, try changing the speaker on
                     your computer or increase the volume on your device.
                  </Typography>
               )}
            </Box>
         )}
      </Stack>
   );
};

export default AudioTab;

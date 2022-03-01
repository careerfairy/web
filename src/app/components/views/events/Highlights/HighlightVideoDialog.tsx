import React from "react";
import Dialog from "@mui/material/Dialog";
import { useVideo } from "react-use";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";

const Content = ({ videoUrl, onClose }: ContentProps) => {
   const [video, _, controls] = useVideo(
      <Box
         sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: 4,
            background: "black",
         }}
         component="video"
         controls
         src={videoUrl}
         autoPlay
      />
   );

   return <>{video}</>;
};
const HighlightVideoDialog = ({
   videoUrl,
   handleClose,
}: HighlightVideoDialogProps) => {
   const onClose = () => {
      handleClose();
   };
   return (
      <Dialog
         onClose={onClose}
         TransitionComponent={Slide}
         maxWidth={"lg"}
         PaperProps={{
            sx: {
               borderRadius: 2,
               boxShadow: 4,
               background: "black",
            },
         }}
         fullWidth
         open={Boolean(videoUrl)}
      >
         <Content onClose={onClose} videoUrl={videoUrl} />
      </Dialog>
   );
};
interface HighlightVideoDialogProps {
   videoUrl?: string;
   handleClose: () => void;
}
interface ContentProps {
   videoUrl: string;
   onClose: () => void;
}

export default HighlightVideoDialog;

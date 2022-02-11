import React, { FC, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Stack } from "@mui/material";
import OptionCard from "../common/OptionCard";

interface Props {
   handleReconnectAgora: () => Promise<void>;
}
const UidConflict: FC<Props> = ({ handleReconnectAgora }) => {
   const [steps] = useState([
      {
         title: "Close the stream and continue here",
         onClick: handleReconnectAgora,
      },
   ]);

   return (
      <Dialog open={true}>
         <DialogTitle>
            You seem to have the stream open on another window:
         </DialogTitle>
         <DialogContent dividers>
            <Stack spacing={2}>
               {steps.map((step, index) => (
                  <OptionCard {...step} number={index + 1} key={step.title} />
               ))}
            </Stack>
         </DialogContent>
      </Dialog>
   );
};

export default UidConflict;

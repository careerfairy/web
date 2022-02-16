import React, { FC } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Stack } from "@mui/material";
import OptionCard, { OptionCardProps } from "../common/OptionCard";

interface Props {
   steps: OptionCardProps[];
}
const DebugModal: FC<Props> = (props) => {
   return (
      <Dialog open={true}>
         <DialogTitle>Having issues? Here are some possible fixes:</DialogTitle>
         <DialogContent dividers>
            <Stack spacing={2}>
               {props.steps.map((step, index) => (
                  <OptionCard {...step} number={index + 1} key={step.title} />
               ))}
            </Stack>
         </DialogContent>
      </Dialog>
   );
};

export default DebugModal;

import React, { FC, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Stack } from "@mui/material";
import OptionCard from "../common/OptionCard";

interface Props {
   handleEnableProxy: () => Promise<any>;
}
const FailedToSubscribeWithoutProxy: FC<Props> = (props) => {

   const [steps] = useState([
      {
         title: "Compatibility mode",
         description: "Try again using the compatibility mode",
         onClick: props.handleEnableProxy,
      },
   ]);

   return (
      <Dialog open={true}>
         <DialogTitle>Having issues? Here are some possible fixes:</DialogTitle>
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

export default FailedToSubscribeWithoutProxy;

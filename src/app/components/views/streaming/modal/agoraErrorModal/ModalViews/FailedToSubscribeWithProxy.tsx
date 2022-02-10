import React, { FC, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Stack } from "@mui/material";
import OptionCard from "../common/OptionCard";
import { useRouter } from "next/router";

interface Props {
   handleEnableProxy: (strictMode: boolean) => Promise<any>;
}
const FailedToSubscribeWithProxy: FC<Props> = (props) => {
   const router = useRouter();
   const [steps] = useState([
      {
         title: "Strict network mode",
         description: "Use strict network mode",
         onClick: () => props.handleEnableProxy(true),
      },
      {
         title: "Change Network",
         description: "Try switching to another network or mobile hotspot",
      },
      {
         title: "Page Refresh",
         onClick: router.reload,
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

export default FailedToSubscribeWithProxy;

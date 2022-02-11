import React, { FC, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Stack } from "@mui/material";
import OptionCard from "../common/OptionCard";
import { useRouter } from "next/router";

interface Props {}
const UidConflict: FC<Props> = (props) => {
   const router = useRouter();
   const [steps] = useState([
      {
         title: "Close the stream and continue here",
         onClick: router.reload,
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

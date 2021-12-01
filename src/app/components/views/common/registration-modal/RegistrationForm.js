import React, { useContext } from "react";
// import FirstStep from "./FirstStep";
// import SecondStep from "./SecondStep";
// import Confirm from "./Confirm";
// import Success from "./Success";
import { Box, Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import { RegistrationContext } from "context/registration/RegistrationContext";
import CategorySelect from "./steps/CategorySelect";

// Step titles
const labels = ["Select your categories", "Add a Question", "Upvote questions"];
const handleSteps = (step) => {
   switch (step) {
      case 0:
         return <CategorySelect />;
      case 1:
         return <div>questions step</div>;
      case 2:
         return <div>upvote questions step</div>;
      default:
         throw new Error("Unknown step");
   }
};

const RegistrationForm = () => {
   const { activeStep } = useContext(RegistrationContext);

   return (
      <>
         {activeStep === labels.length ? (
            <div>congrats step</div>
         ) : (
            <>
               {/*<Box sx={{ my: 5 }}>*/}
               {/*   <Typography variant="h4" align="center">*/}
               {/*      {labels[activeStep]}*/}
               {/*   </Typography>*/}
               {/*</Box>*/}
               {/*<Stepper activeStep={activeStep} sx={{ py: 3 }} alternativeLabel>*/}
               {/*   {labels.map((label) => (*/}
               {/*      <Step key={label}>*/}
               {/*         <StepLabel>{label}</StepLabel>*/}
               {/*      </Step>*/}
               {/*   ))}*/}
               {/*</Stepper>*/}

               {handleSteps(activeStep)}
            </>
         )}
      </>
   );
};

export default RegistrationForm;

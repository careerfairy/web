import React, { useContext } from "react";
import { Box, Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import { RegistrationContext } from "context/registration/RegistrationContext";
import CategorySelect from "./steps/CategorySelect";
import QuestionUpvote from "./steps/QuestionUpvote";
import QuestionCreateForm from "./steps/QuestionCreateForm";
import TalentPoolJoin from "./steps/TalentPoolJoin";
import RegistrationComplete from "./steps/RegistrationComplete";

const handleSteps = (step) => {
   switch (step) {
      case 0:
         return <CategorySelect />;
      case 1:
         return <QuestionUpvote />;
      case 2:
         return <QuestionCreateForm />;
      case 3:
         return <TalentPoolJoin />;
      case 4:
         return <RegistrationComplete />;
      default:
         throw new Error("Unknown step");
   }
};

const RegistrationForm = () => {
   const { activeStep, labels } = useContext(RegistrationContext);

   return (
      <>
         {activeStep === labels.length ? (
            <RegistrationComplete />
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

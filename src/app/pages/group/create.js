import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { withFirebase } from "../../context/firebase/FirebaseServiceContext";
import Header from "../../components/views/header/Header";
import Footer from "../../components/views/footer/Footer";
import CreateBaseGroup from "../../components/views/group/create/CreateBaseGroup";
import CreateCategories from "../../components/views/group/create/CreateCategories";
import CompleteGroup from "../../components/views/group/create/CompleteGroup";
import { GlobalBackground } from "../../materialUI/GlobalBackground/GlobalBackGround";
import Loader from "../../components/views/loader/Loader";
import { useAuth } from "../../HOCs/AuthProvider";

import { Stepper, Step, StepLabel, Container } from "@mui/material";
import { useSnackbar } from "notistack";
import { GENERAL_ERROR } from "../../components/util/constants";
import defaultCategories from "../../components/views/group/create/defaultCategories";

function getSteps() {
   return [
      "Create your base group",
      "Setup your categories and sub-categories",
      "Finish",
   ];
}

const CreateGroup = ({ firebase }) => {
   const router = useRouter();
   const { enqueueSnackbar } = useSnackbar();
   const [activeStep, setActiveStep] = useState(0);
   const [baseGroupInfo, setBaseGroupInfo] = useState({});
   const [arrayOfCategories, setArrayOfCategories] =
      useState(defaultCategories);
   const { userData, authenticatedUser: user, loading } = useAuth();

   useEffect(() => {
      if (user === null) {
         router.replace("/login");
      }
   }, [user]);

   const steps = getSteps();

   const dynamicSort = (property) => {
      let sortOrder = 1;
      if (property[0] === "-") {
         sortOrder = -1;
         property = property.substr(1);
      }
      return function (a, b) {
         /* next line works with strings and numbers,
          * and you may want to customize it to your needs
          */
         const result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
         return result * sortOrder;
      };
   };

   const handleAddTempCategory = (categoryObj) => {
      // adds temporary categories locally
      if (categoryObj && categoryObj.options && categoryObj.options.length) {
         categoryObj.options.sort(dynamicSort("name"));
      }
      setArrayOfCategories([...arrayOfCategories, categoryObj]);
   };

   const handleUpdateCategory = (categoryObj) => {
      // updates the temporary categories locally
      if (categoryObj && categoryObj.options && categoryObj.options.length) {
         categoryObj.options.sort(dynamicSort("name"));
      }
      const newCategories = [...arrayOfCategories];
      const indexOfOldObj = newCategories.findIndex(
         (el) => categoryObj.id === el.id
      );
      newCategories[indexOfOldObj] = categoryObj;
      setArrayOfCategories(newCategories);
   };

   const handleDeleteLocalCategory = (categoryObjId) => {
      // deletes the temporary categories locally
      const newCategories = [...arrayOfCategories];
      const newerCategories = newCategories.filter(
         (el) => el.id !== categoryObjId
      );
      setArrayOfCategories(newerCategories);
   };

   const handleNext = () => {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
   };

   const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
   };

   const handleReset = () => {
      setBaseGroupInfo({});
      setActiveStep(0);
   };

   const setServerLogoUrl = (serverUrl) => {
      setBaseGroupInfo({ ...baseGroupInfo, logoUrl: serverUrl });
   };

   const uploadLogo = async (fileObject) => {
      try {
         var storageRef = firebase.getStorageRef();
         let fullPath = "group-logos" + "/" + fileObject.name;
         let companyLogoRef = storageRef.child(fullPath);
         var uploadTask = companyLogoRef.put(fileObject);
         return uploadTask.snapshot.ref.getDownloadURL();
      } catch (e) {
         console.log("error in async", e);
      }
   };

   const createCareerCenter = async () => {
      try {
         const downloadURL = await uploadLogo(baseGroupInfo.logoFileObj);
         const careerCenter = {
            universityName: baseGroupInfo.universityName,
            adminEmails: baseGroupInfo.adminEmails,
            logoUrl: downloadURL,
            description: baseGroupInfo.description,
            test: false,
            categories: arrayOfCategories,
         };
         let ref = await firebase.createCareerCenter(careerCenter, user.email);
         await router.push(`/group/${ref.id}/admin`);
         enqueueSnackbar(
            `Congrats! Your group ${baseGroupInfo.universityName} has now been created`,
            {
               variant: "success",
               preventDuplicate: true,
            }
         );
      } catch (e) {
         console.log("error in creating group", e);
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         });
      }
   };

   function getStepContent(stepIndex) {
      switch (stepIndex) {
         case 0:
            return (
               <CreateBaseGroup
                  setBaseGroupInfo={setBaseGroupInfo}
                  baseGroupInfo={baseGroupInfo}
                  handleNext={handleNext}
                  handleBack={handleBack}
               />
            );
         case 1:
            return (
               <CreateCategories
                  handleDeleteLocalCategory={handleDeleteLocalCategory}
                  handleUpdateCategory={handleUpdateCategory}
                  handleAddTempCategory={handleAddTempCategory}
                  arrayOfCategories={arrayOfCategories}
                  handleNext={handleNext}
                  handleBack={handleBack}
                  handleReset={handleReset}
                  activeStep={activeStep}
               />
            );
         case 2:
            return (
               <CompleteGroup
                  createCareerCenter={createCareerCenter}
                  baseGroupInfo={baseGroupInfo}
                  setActiveStep={setActiveStep}
                  handleBack={handleBack}
                  arrayOfCategories={arrayOfCategories}
               />
            );
         default:
            return "Unknown stepIndex";
      }
   }

   if (user === null || userData === null || loading === true) {
      return <Loader />;
   }

   return (
      <GlobalBackground>
         <Head>
            <title key="title">CareerFairy | Create a group</title>
         </Head>
         <Header classElement="relative white-background" />
         <Container>
            <Stepper
               style={{ backgroundColor: "#FAFAFA" }}
               activeStep={activeStep}
               alternativeLabel
            >
               {steps.map((label) => (
                  <Step key={label}>
                     <StepLabel>{label}</StepLabel>
                  </Step>
               ))}
            </Stepper>
            {getStepContent(activeStep)}
         </Container>
         <Footer />
      </GlobalBackground>
   );
};

export default withFirebase(CreateGroup);

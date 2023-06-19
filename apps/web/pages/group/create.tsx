import { useEffect, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import Header from "../../components/views/header/Header"
import Footer from "../../components/views/footer/Footer"
import CreateBaseGroup, {
   GroupedUniversity,
} from "../../components/views/group/create/CreateBaseGroup"
import CreateGroupQuestions from "../../components/views/group/create/CreateGroupQuestions"
import CompleteGroup from "../../components/views/group/create/CompleteGroup"
import { GlobalBackground } from "../../materialUI/GlobalBackground/GlobalBackGround"
import Loader from "../../components/views/loader/Loader"
import { useAuth } from "../../HOCs/AuthProvider"
import { v4 as uuidv4 } from "uuid"

import { Container, Step, StepLabel, Stepper } from "@mui/material"
import {
   Group,
   GroupQuestion,
   sortGroupQuestionOptionsByName,
} from "@careerfairy/shared-lib/dist/groups"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { fieldOfStudyRepo } from "../../data/RepositoryInstances"
import { dynamicSort } from "@careerfairy/shared-lib/dist/utils"
import useSnackbarNotifications from "../../components/custom-hook/useSnackbarNotifications"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"

function getSteps() {
   return [
      "Create your base group",
      "Setup your categories and sub-categories",
      "Finish",
   ]
}

export type BaseGroupInfo = {
   logoUrl?: string
   logoFileObj?: File
   description?: string
   test?: boolean
   universityName?: string
   university?: GroupedUniversity
   isUniversity?: boolean
   companySize?: string
   companyIndustries?: OptionGroup[]
   companyCountry?: OptionGroup
   isATSEnabled?: boolean
}
const CreateGroup = () => {
   const firebase = useFirebaseService()
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const router = useRouter()
   const [activeStep, setActiveStep] = useState(0)
   const [baseGroupInfo, setBaseGroupInfo] = useState<BaseGroupInfo>({})
   const [groupQuestions, setGroupQuestions] = useState<GroupQuestion[]>([])
   const [loadingDefaultQuestions, setLoadingDefaultQuestions] = useState(false)
   const { userData, authenticatedUser: user, isLoggedIn } = useAuth()

   useEffect(() => {
      if (user === null) {
         router.replace("/login")
      }
   }, [user])

   useEffect(() => {
      if (baseGroupInfo.university?.id) {
         if (!groupQuestions.length) {
            void setFieldAndLevelOfStudyQuestions()
         }
      } else {
         clearFieldAndLevelOfStudyQuestions()
      }
   }, [Boolean(baseGroupInfo.university?.id)])

   const steps = getSteps()

   const clearFieldAndLevelOfStudyQuestions = () => setGroupQuestions([])

   const setFieldAndLevelOfStudyQuestions = async () => {
      try {
         // get all level and fields of study
         setLoadingDefaultQuestions(true)
         const [levelsOfStudy, fieldsOfStudy] = await Promise.all([
            fieldOfStudyRepo.getAllLevelsOfStudy(),
            fieldOfStudyRepo.getAllFieldsOfStudy(),
         ])
         const initialCategories = [
            createGroupQuestionFromUserInfoCollection(
               levelsOfStudy,
               "levelOfStudy"
            ),
            createGroupQuestionFromUserInfoCollection(
               fieldsOfStudy,
               "fieldOfStudy"
            ),
         ]
         setGroupQuestions(initialCategories)
      } catch (e) {
         errorNotification(e)
      }
      setLoadingDefaultQuestions(false)
   }

   const createGroupQuestionFromUserInfoCollection = (
      userInfoCollectionDocsInfo: FieldOfStudy[],
      type: Exclude<GroupQuestion["questionType"], "custom">
   ): GroupQuestion => {
      if (type !== "fieldOfStudy" && type !== "levelOfStudy")
         throw new Error("Invalid category type")
      return {
         id: uuidv4(),
         name: type === "fieldOfStudy" ? "Field of Study" : "Level of Study",
         hidden: false,
         questionType: type,
         options: userInfoCollectionDocsInfo.reduce<GroupQuestion["options"]>(
            (acc, curr) => {
               return {
                  ...acc,
                  [curr.id]: {
                     name: curr.name,
                     id: curr.id,
                  },
               }
            },
            {}
         ),
      }
   }

   const handleAddTempGroupQuestion = (categoryObj) => {
      // adds temporary categories locally
      if (categoryObj && categoryObj.options && categoryObj.options.length) {
         categoryObj.options.sort(dynamicSort("name"))
      }
      setGroupQuestions([...groupQuestions, categoryObj])
   }

   const handleUpdateGroupQuestion = (categoryObj: GroupQuestion) => {
      // updates the temporary categories locally
      const updatedCategory = {
         ...categoryObj,
         options: sortGroupQuestionOptionsByName(categoryObj.options),
      }
      setGroupQuestions((prevCategories) =>
         prevCategories.map((category) => {
            if (category.id === updatedCategory.id) {
               return updatedCategory
            }
            return category
         })
      )
   }

   const handleDeleteLocalGroupQuestion = (categoryObjId) => {
      // deletes the temporary categories locally
      setGroupQuestions((prevCategories) =>
         prevCategories.filter((el) => el.id !== categoryObjId)
      )
   }

   const handleNext = () => {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
   }

   const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1)
   }

   const uploadLogo = async (fileObject) => {
      try {
         const storageRef = firebase.getStorageRef()
         let fullPath = "group-logos" + "/" + fileObject.name
         let companyLogoRef = storageRef.child(fullPath)
         const uploadTask = companyLogoRef.put(fileObject)
         await uploadTask.then()
         return uploadTask.snapshot.ref.getDownloadURL()
      } catch (e) {
         console.log("error in async", e)
      }
   }

   const createCareerCenter = async () => {
      try {
         const downloadURL = await uploadLogo(baseGroupInfo.logoFileObj)
         const careerCenter: Omit<Group, "id" | "groupId" | "triGrams"> = {
            universityName: baseGroupInfo.universityName?.trim(),
            logoUrl: downloadURL,
            description: baseGroupInfo.description?.trim(),
            test: false,
            ...(baseGroupInfo.university?.id && {
               universityCode: baseGroupInfo.university.id,
            }),
            atsAdminPageFlag: baseGroupInfo.isATSEnabled,
            companyCountry: baseGroupInfo.companyCountry,
            companyIndustries: baseGroupInfo.companyIndustries,
            companySize: baseGroupInfo.companySize,
         }

         const { data } = await firebase.createGroup({
            group: careerCenter,
            groupQuestions,
         })
         const id = data.id
         return await router.push(`/group/${id}/admin`).then(() => {
            successNotification(
               `Congrats! Your group ${baseGroupInfo.universityName} has now been created`
            )
         })
      } catch (e) {
         errorNotification(e)
      }
      return
   }

   const handleSkipNext = () =>
      setActiveStep((prevActiveStep) => prevActiveStep + 2)
   const handleSkipBack = () =>
      setActiveStep((prevActiveStep) => prevActiveStep - 2)
   function getStepContent(stepIndex) {
      switch (stepIndex) {
         case 0:
            return (
               <CreateBaseGroup
                  setBaseGroupInfo={setBaseGroupInfo}
                  baseGroupInfo={baseGroupInfo}
                  handleSkipNext={handleSkipNext}
                  handleNext={handleNext}
               />
            )
         case 1:
            return (
               <CreateGroupQuestions
                  handleDeleteLocalGroupQuestion={
                     handleDeleteLocalGroupQuestion
                  }
                  loadingDefaultQuestions={loadingDefaultQuestions}
                  handleUpdateGroupQuestion={handleUpdateGroupQuestion}
                  handleAddTempGroupQuestion={handleAddTempGroupQuestion}
                  groupQuestions={groupQuestions}
                  handleNext={handleNext}
                  handleBack={handleBack}
               />
            )
         case 2:
            return (
               <CompleteGroup
                  createCareerCenter={createCareerCenter}
                  baseGroupInfo={baseGroupInfo}
                  handleBack={handleBack}
                  handleSkipBack={handleSkipBack}
                  groupQuestions={groupQuestions}
               />
            )
         default:
            return "Unknown stepIndex"
      }
   }

   if (user === null || userData === null || isLoggedIn !== true) {
      return <Loader />
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
   )
}

export default CreateGroup

import { useEffect, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import Header from "../../components/views/header/Header"
import Footer from "../../components/views/footer/Footer"
import CreateBaseGroup from "../../components/views/group/create/CreateBaseGroup"
import CreateCategories from "../../components/views/group/create/CreateCategories"
import CompleteGroup from "../../components/views/group/create/CompleteGroup"
import { GlobalBackground } from "../../materialUI/GlobalBackground/GlobalBackGround"
import Loader from "../../components/views/loader/Loader"
import { useAuth } from "../../HOCs/AuthProvider"
import { v4 as uuidv4 } from "uuid"

import { Container, Step, StepLabel, Stepper } from "@mui/material"
import { useSnackbar } from "notistack"
import { GENERAL_ERROR } from "../../components/util/constants"
import {
   CustomCategory,
   sortCustomCategoryOptionsByName,
} from "@careerfairy/shared-lib/dist/groups"
import levelOfStudyRepo from "../../data/firebase/LevelOfStudyRepository"
import fieldOfStudyRepo from "../../data/firebase/FieldOfStudyRepository"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { LevelOfStudy } from "@careerfairy/shared-lib/dist/levelOfStudy"
import { useDispatch } from "react-redux"
import * as actions from "../../store/actions"
import groupRepo from "../../data/firebase/GroupRepository"

function getSteps() {
   return [
      "Create your base group",
      "Setup your categories and sub-categories",
      "Finish",
   ]
}

export type BaseGroupInfo = {
   adminEmails?: string[]
   logoUrl?: string
   logoFileObj?: File
   description?: string
   test?: boolean
   universityName?: string
}
const CreateGroup = () => {
   const firebase = useFirebaseService()
   const dispatch = useDispatch()
   const router = useRouter()
   const { enqueueSnackbar } = useSnackbar()
   const [activeStep, setActiveStep] = useState(0)
   const [baseGroupInfo, setBaseGroupInfo] = useState<BaseGroupInfo>({})
   const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
      []
   )
   const { userData, authenticatedUser: user, isLoggedIn } = useAuth()

   useEffect(() => {
      if (user === null) {
         router.replace("/login")
      }
   }, [user])

   useEffect(() => {
      void setDefaultCategories()
   }, [])

   const steps = getSteps()

   const setDefaultCategories = async () => {
      try {
         // get all level and fields of study
         const [levelsOfStudy, fieldsOfStudy] = await Promise.all([
            levelOfStudyRepo.getAllLevelsOfStudy(),
            fieldOfStudyRepo.getAllFieldsOfStudy(),
         ])
         const initialCategories = [
            createCustomCategoryFromUserInfoCollection(
               levelsOfStudy,
               "levelOfStudy"
            ),
            createCustomCategoryFromUserInfoCollection(
               fieldsOfStudy,
               "fieldOfStudy"
            ),
         ]
         setCustomCategories(initialCategories)
      } catch (e) {
         sendError(e)
      }
   }

   const sendError = (error: any) => {
      dispatch(actions.sendGeneralError(error))
   }

   const createCustomCategoryFromUserInfoCollection = (
      userInfoCollectionDocsInfo: FieldOfStudy[] | LevelOfStudy[],
      type: Exclude<CustomCategory["categoryType"], "custom">
   ): CustomCategory => {
      if (type !== "fieldOfStudy" && type !== "levelOfStudy")
         throw new Error("Invalid category type")
      return {
         id: uuidv4(),
         name: type === "fieldOfStudy" ? "Field of Study" : "Level of Study",
         hidden: false,
         categoryType: type,
         options: userInfoCollectionDocsInfo.reduce<CustomCategory["options"]>(
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
   const dynamicSort = (property) => {
      let sortOrder = 1
      if (property[0] === "-") {
         sortOrder = -1
         property = property.substr(1)
      }
      return function (a, b) {
         /* next line works with strings and numbers,
          * and you may want to customize it to your needs
          */
         const result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0
         return result * sortOrder
      }
   }

   const handleAddTempCategory = (categoryObj) => {
      // adds temporary categories locally
      if (categoryObj && categoryObj.options && categoryObj.options.length) {
         categoryObj.options.sort(dynamicSort("name"))
      }
      setCustomCategories([...customCategories, categoryObj])
   }

   const handleUpdateCategory = (categoryObj: CustomCategory) => {
      // updates the temporary categories locally
      const updatedCategory = {
         ...categoryObj,
         options: sortCustomCategoryOptionsByName(categoryObj.options),
      }
      setCustomCategories((prevCategories) =>
         prevCategories.map((category) => {
            if (category.id === updatedCategory.id) {
               return updatedCategory
            }
            return category
         })
      )
   }

   const handleDeleteLocalCategory = (categoryObjId) => {
      // deletes the temporary categories locally
      setCustomCategories((prevCategories) =>
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
         const careerCenter = {
            universityName: baseGroupInfo.universityName,
            adminEmails: baseGroupInfo.adminEmails,
            logoUrl: downloadURL,
            description: baseGroupInfo.description,
            test: false,
         }
         const ref = await groupRepo.createGroup(
            careerCenter,
            customCategories,
            user.email
         )
         await router.push(`/group/${ref.id}/admin`)
         enqueueSnackbar(
            `Congrats! Your group ${baseGroupInfo.universityName} has now been created`,
            {
               variant: "success",
               preventDuplicate: true,
            }
         )
      } catch (e) {
         console.log("error in creating group", e)
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
      }
   }

   function getStepContent(stepIndex) {
      switch (stepIndex) {
         case 0:
            return (
               <CreateBaseGroup
                  setBaseGroupInfo={setBaseGroupInfo}
                  baseGroupInfo={baseGroupInfo}
                  handleNext={handleNext}
               />
            )
         case 1:
            return (
               <CreateCategories
                  handleDeleteLocalCategory={handleDeleteLocalCategory}
                  handleUpdateCategory={handleUpdateCategory}
                  handleAddTempCategory={handleAddTempCategory}
                  arrayOfCategories={customCategories}
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
                  arrayOfCategories={customCategories}
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

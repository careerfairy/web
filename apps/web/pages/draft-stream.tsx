import { PaperBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import Head from "next/head"
import React, { useEffect, useRef, useState } from "react"
import { Typography } from "@mui/material"
import DraftStreamForm from "../components/views/draftStreamForm/DraftStreamForm"
import {
   buildLivestreamObject,
   buildPromotionObj,
} from "../components/helperFunctions/streamFormFunctions"
import { useSnackbar } from "notistack"
import { useRouter } from "next/router"
import {
   GENERAL_ERROR,
   SAVE_WITH_NO_VALIDATION,
   SUBMIT_FOR_APPROVAL,
} from "../components/util/constants"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"
import { useAuth } from "../HOCs/AuthProvider"
import EnterDetailsModal from "../components/views/draftStreamForm/EnterDetailsModal"
import { prettyLocalizedDate } from "../components/helperFunctions/HelperFunctions"
import GeneralLayout from "../layouts/GeneralLayout"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { StreamCreationProvider } from "../components/views/draftStreamForm/StreamForm/StreamCreationProvider"
import { customJobServiceInstance } from "../data/firebase/CustomJobService"

const DraftStream = () => {
   const firebaseService = useFirebaseService()
   const [showEnterDetailsModal, setShowEnterDetailsModal] = useState(false)
   const [submitted, setSubmitted] = useState(false)
   const { authenticatedUser, userData } = useAuth()
   const [userInfo, setUserInfo] = useState<any>({})
   const { enqueueSnackbar } = useSnackbar()
   const router = useRouter()
   const formRef = useRef()
   const {
      query: { absolutePath },
      push,
   } = router

   useEffect(() => {
      if (userData) {
         setUserInfo({
            ...userData,
            name: `${userData.firstName} ${userData.lastName}`,
            email: (userData as any).email || userData.userEmail,
         })
      }
   }, [userData])

   const handleOpenShowEnterDetailsModal = () => {
      setShowEnterDetailsModal(true)
   }
   const handleCloseShowEnterDetailsModal = () => {
      setShowEnterDetailsModal(false)
   }

   const handleSubmit = () => {
      if (formRef.current) {
         // @ts-ignore
         formRef.current.handleSubmit()
      }
   }

   const sendApprovalNotifications = async (
      groupIds = ["groupIds"],
      streamId = "streamId"
   ) => {
      for (const groupId of groupIds) {
         const notificationDetails = {
            requester:
               authenticatedUser?.email || userInfo.email || "anonymous",
            receiver: groupId,
            draftId: streamId,
            type: "draftApprovalRequest",
         }
         const notificationRef = await firebaseService.createNotification(
            notificationDetails,
            { force: true }
         )
         console.info(
            `notification Ref was created with ID ${notificationRef.id}`
         )
      }
   }

   const onSubmit = async (
      values,
      { setSubmitting },
      updateMode,
      draftStreamId,
      setFormData,
      setDraftId,
      status,
      setStatus,
      selectedJobs,
      selectedCustomJobs,
      metaData
   ) => {
      let livestream

      try {
         setSubmitting(true)
         livestream = buildLivestreamObject(
            values,
            updateMode,
            draftStreamId,
            firebaseService
         ) as LivestreamEvent
         if (status === SUBMIT_FOR_APPROVAL) {
            if (!userInfo.email || !userInfo.name) {
               handleOpenShowEnterDetailsModal()
               return
            }
            livestream.status = {
               pendingApproval: true,
               seen: false,
            }
         }

         if (selectedJobs) {
            livestream.jobs = selectedJobs
            livestream.hasJobs = selectedJobs.length > 0
         }

         livestream.hasCustomJobs = selectedCustomJobs?.length > 0
         const selectedCustomJobsIds = selectedCustomJobs.map((job) => job.id)

         if (metaData) {
            livestream.companySizes = metaData.companySizes
            livestream.companyIndustries = metaData.companyIndustries
            livestream.companyCountries = metaData.companyCountries
         }

         const promotion = buildPromotionObj(values, livestream.id)

         let id
         if (updateMode) {
            id = livestream.id
            if (!livestream.author) {
               livestream.author = {
                  email:
                     authenticatedUser?.email || userInfo.email || "anonymous",
               }
            }
            await firebaseService.updateLivestream(
               livestream,
               "draftLivestreams",
               promotion
            )

            await customJobServiceInstance.updateCustomJobWithLinkedLivestreams(
               livestream.id,
               selectedCustomJobsIds
            )

            // console.log("-> Draft livestream was updated with id", id);
         } else {
            const author = {
               email: authenticatedUser?.email || userInfo.email || "anonymous",
            }
            id = await firebaseService.addLivestream(
               livestream,
               "draftLivestreams",
               author,
               {}
            )

            await customJobServiceInstance.updateCustomJobWithLinkedLivestreams(
               livestream.id,
               selectedCustomJobsIds
            )

            // console.log("-> Draft livestream was created with id", id);
            push(`/draft-stream?draftStreamId=${id}`).catch()
         }

         if (status === SUBMIT_FOR_APPROVAL) {
            const submitTime = prettyLocalizedDate(new Date())
            const senderName = userInfo.name
            const senderEmail = userInfo.email
            await firebaseService.sendDraftApprovalRequestEmail({
               senderName,
               livestream,
               submitTime,
               senderEmail,
            })
            await sendApprovalNotifications(livestream.groupIds || [], id)
         }

         if (absolutePath) {
            return push({
               pathname: absolutePath as string,
            })
         }
         setDraftId(id)
         setSubmitted(true)
         window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
         if (status === SAVE_WITH_NO_VALIDATION) {
            enqueueSnackbar("You changes have been saved!", {
               variant: "default",
               preventDuplicate: true,
            })
         }
      } catch (e) {
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
         console.log("-> e", e)
      } finally {
         setSubmitting(false)

         if (livestream && status === SUBMIT_FOR_APPROVAL) {
            // only update the form at the end to not force a rerender
            // and because of it the isSubmitting flag will be false until the end of this logic
            setFormData((prevState) => ({
               ...prevState,
               status: livestream.status,
            }))
         }
      }
   }

   return (
      <>
         <Head>
            <title key="title">CareerFairy | Draft a Live Stream</title>
         </Head>
         <GeneralLayout>
            <PaperBackground style={{ paddingBottom: 0 }}>
               <Typography
                  variant="h3"
                  align="center"
                  style={{
                     marginTop: submitted ? "15vh" : "1.5rem",
                  }}
                  gutterBottom
               >
                  {submitted ? "Success!" : "Draft a Live Stream"}
               </Typography>
               <StreamCreationProvider>
                  <DraftStreamForm
                     onSubmit={onSubmit}
                     formRef={formRef}
                     submitted={submitted}
                     setSubmitted={setSubmitted}
                  />
               </StreamCreationProvider>
               <EnterDetailsModal
                  open={showEnterDetailsModal}
                  handleSubmit={handleSubmit}
                  onClose={handleCloseShowEnterDetailsModal}
                  setUserInfo={setUserInfo}
                  userInfo={userInfo}
               />
            </PaperBackground>
         </GeneralLayout>
      </>
   )
}

export default DraftStream

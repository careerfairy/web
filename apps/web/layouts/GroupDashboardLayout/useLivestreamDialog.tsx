import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { prettyLocalizedDate } from "components/helperFunctions/HelperFunctions"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useAuth } from "HOCs/AuthProvider"
import { useRouter } from "next/router"
import { useCallback, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { v4 as uuidv4 } from "uuid"
import * as actions from "store/actions"
import { StreamCreationProvider } from "components/views/draftStreamForm/StreamForm/StreamCreationProvider"
import NewStreamModal from "components/views/group/admin/events/NewStreamModal"

/**
 * State & Actions for the Create/Edit livestream dialog form
 */
export const useLivestreamDialog = (group: Group) => {
   const [openNewStreamModal, setOpenNewStreamModal] = useState(false)
   const [isPublishing, setIsPublishing] = useState(false)
   const [currentStream, setCurrentStream] = useState<LivestreamEvent>(null)
   const { userData, authenticatedUser } = useAuth()
   const dispatch = useDispatch()
   const { replace } = useRouter()

   const { sendNewlyPublishedEventEmail, deleteLivestream, addLivestream } =
      useFirebaseService()

   const handleOpenNewStreamModal = useCallback(() => {
      setOpenNewStreamModal(true)
   }, [])

   const handleResetCurrentStream = useCallback(() => {
      setCurrentStream(null)
   }, [])

   const handleCloseNewStreamModal = useCallback(() => {
      handleResetCurrentStream()
      setOpenNewStreamModal(false)
   }, [handleResetCurrentStream])

   const handleEditStream = useCallback(
      (streamObj) => {
         if (streamObj) {
            setCurrentStream(streamObj)
            handleOpenNewStreamModal()
         }
      },
      [handleOpenNewStreamModal]
   )

   const getAuthor = useCallback(
      (livestream) => {
         return livestream?.author?.email
            ? livestream.author
            : {
                 email: authenticatedUser.email,
                 ...(group?.id && { groupId: group.id }),
              }
      },
      [authenticatedUser.email, group?.id]
   )

   const handlePublishStream = useCallback(
      async (streamObj, promotion) => {
         try {
            setIsPublishing(true)
            const newStream = { ...streamObj }
            newStream.companyId = uuidv4()
            const author = getAuthor(newStream)
            const publishedStreamId = await addLivestream(
               newStream,
               "livestreams",
               author,
               promotion
            )
            newStream.id = publishedStreamId

            const submitTime = prettyLocalizedDate(new Date())

            const senderName = `${userData.firstName} ${userData.lastName}`

            await sendNewlyPublishedEventEmail({
               senderName,
               stream: newStream,
               submitTime,
            })
            await deleteLivestream(streamObj.id, "draftLivestreams")
            await replace(
               `/group/${group.id}/admin/events?eventId=${publishedStreamId}`
            )
         } catch (e) {
            setIsPublishing(false)
            dispatch(actions.sendGeneralError(e))
         }
      },
      [
         getAuthor,
         addLivestream,
         userData?.firstName,
         userData?.lastName,
         sendNewlyPublishedEventEmail,
         deleteLivestream,
         replace,
         group?.id,
         dispatch,
      ]
   )

   const StreamCreationDialog = useMemo(() => {
      return openNewStreamModal ? (
         <StreamCreationProvider>
            <NewStreamModal
               group={group}
               typeOfStream={
                  // every new livestream creation should be a draft
                  // unless its a livestream obj without the isDraft flag
                  // which should be an actual livestream
                  currentStream && !currentStream.isDraft ? "upcoming" : "draft"
               }
               open={openNewStreamModal}
               handlePublishStream={handlePublishStream}
               handleResetCurrentStream={handleResetCurrentStream}
               currentStream={currentStream}
               onClose={handleCloseNewStreamModal}
            />
         </StreamCreationProvider>
      ) : undefined
   }, [
      currentStream,
      group,
      handleCloseNewStreamModal,
      handlePublishStream,
      handleResetCurrentStream,
      openNewStreamModal,
   ])

   return useMemo(
      () => ({
         openNewStreamModal,
         setOpenNewStreamModal,
         currentStream,
         setCurrentStream,
         handleOpenNewStreamModal,
         handleResetCurrentStream,
         handleCloseNewStreamModal,
         handleEditStream,
         handlePublishStream,
         isPublishing,
         StreamCreationDialog,
      }),
      [
         StreamCreationDialog,
         currentStream,
         handleCloseNewStreamModal,
         handleEditStream,
         handleOpenNewStreamModal,
         handlePublishStream,
         handleResetCurrentStream,
         isPublishing,
         openNewStreamModal,
      ]
   )
}

import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext";
import { useRouter } from "next/router";
import { useAuth } from "HOCs/AuthProvider";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { LiveStreamEvent } from "types/event";
import { getLinkToStream } from "util/StreamUtil";
import * as actions from "store/actions";

const useRegistrationModal = () => {
   const firebase = useFirebaseService();
   const {
      push,
      query: { groupId },
   } = useRouter();
   const { authenticatedUser } = useAuth();
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined);
   const handleCloseJoinModal = useCallback(
      () => setJoinGroupModalData(undefined),
      []
   );
   const dispatch = useDispatch();

   const handleOpenJoinModal = useCallback(
      (groups: any[], targetGroupId: string, livestream: LiveStreamEvent) =>
         setJoinGroupModalData({
            groups: groups,
            targetGroupId,
            livestream,
         }),
      []
   );

   const handleClickRegister = useCallback(
      async (
         event: LiveStreamEvent,
         targetGroupId: string,
         groups: any[],
         hasRegistered: boolean
      ) => {
         try {
            if (hasRegistered) {
               await firebase.deregisterFromLivestream(
                  event.id,
                  authenticatedUser.email
               );
            } else {
               if (
                  authenticatedUser.isLoggedOut ||
                  !authenticatedUser.emailVerified
               ) {
                  return push({
                     pathname: `/login`,
                     query: {
                        absolutePath: getLinkToStream(
                           event,
                           groupId as string,
                           true
                        ),
                     },
                  });
               }
               return handleOpenJoinModal(groups, targetGroupId, event);
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
      },
      [authenticatedUser, groupId]
   );

   return { handleClickRegister, joinGroupModalData, handleCloseJoinModal };
};

export default useRegistrationModal;

import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext";
import { useRouter } from "next/router";
import { useAuth } from "HOCs/AuthProvider";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { LiveStreamEvent } from "types/event";
import { getLinkToStream } from "util/streamUtil";
import * as actions from "store/actions";

const useRegistrationModal = (
   // if redirected to signup when clicking
   // and the user has finished signing up
   // they should be re-directed to the origin path
   useCurrentPath?: boolean
) => {
   const firebase = useFirebaseService();
   const {
      push,
      query: { groupId },
      asPath,
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
                  authenticatedUser
               );
            } else {
               const emailVerified = firebase.auth?.currentUser?.emailVerified;
               if (
                  (authenticatedUser.isLoaded && authenticatedUser.isEmpty) ||
                  // TODO Must re-enable this after fixing the cloud function validateUserEmailWithPin promise bug
                  !emailVerified
               ) {
                  return push({
                     pathname: `/login`,
                     query: {
                        absolutePath: getLinkToStream(
                           event,
                           groupId as string,
                           true,
                           useCurrentPath ? asPath : undefined
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
      [
         authenticatedUser,
         groupId,
         asPath,
         useCurrentPath,
         firebase?.auth?.currentUser?.emailVerified,
      ]
   );

   return { handleClickRegister, joinGroupModalData, handleCloseJoinModal };
};

export default useRegistrationModal;

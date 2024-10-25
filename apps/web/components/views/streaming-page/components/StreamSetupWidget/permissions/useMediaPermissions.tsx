import { useLocalTracks } from "../../../context"
import { MobileUtils } from "../../../../../../scripts/mobile.utils"
import { MESSAGING_TYPE, PERMISSIONS } from "@careerfairy/shared-lib/messaging"

export enum PermissionType {
   Accepted = "accepted",
   Denied = "denied",
   Prompting = "prompting",
   Unknown = "unknown",
}

function getPermission(activeId: string | undefined, error: Error | undefined) {
   if (activeId && !error) {
      return PermissionType.Accepted
   } else if (!activeId && error) {
      return PermissionType.Denied
   } else if (!activeId && !error) {
      return PermissionType.Prompting
   }

   return PermissionType.Unknown
}

export const useMediaPermissions = () => {
   const {
      activeMicrophoneId,
      fetchMicsError,
      activeCameraId,
      fetchCamerasError,
   } = useLocalTracks()

   MobileUtils.send<PERMISSIONS>(MESSAGING_TYPE.PERMISSIONS, {
      permissions: ["microphone", "camera"],
   })

   const permissions = {
      microphone: getPermission(activeMicrophoneId, fetchMicsError),
      camera: getPermission(activeCameraId, fetchCamerasError),
   }

   return {
      permissions,
      hasDeniedPermissions:
         permissions.microphone === PermissionType.Denied ||
         permissions.camera === PermissionType.Denied,
      isPromptingForPermissions:
         permissions.microphone === PermissionType.Prompting &&
         permissions.camera === PermissionType.Prompting,
      hasAcceptedPermissions:
         permissions.microphone === PermissionType.Accepted &&
         permissions.camera === PermissionType.Accepted,
   }
}

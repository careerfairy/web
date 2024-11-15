import { MobileUtils } from "../../../../../../util/mobile.utils"
import { useLocalTracks } from "../../../context"

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

   const permissions = {
      microphone: MobileUtils.webViewPresence()
         ? PermissionType.Unknown
         : getPermission(activeMicrophoneId, fetchMicsError),
      camera: MobileUtils.webViewPresence()
         ? PermissionType.Unknown
         : getPermission(activeCameraId, fetchCamerasError),
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

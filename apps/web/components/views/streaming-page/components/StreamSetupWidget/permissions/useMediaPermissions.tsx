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
      microphone: getPermission(activeMicrophoneId, fetchMicsError),
      camera: getPermission(activeCameraId, fetchCamerasError),
   }

   return permissions
}

import {
   Creator,
   CreatorRole,
   CreatorRoles,
} from "@careerfairy/shared-lib/groups/creators"

export const getRoles = (creator: Creator): CreatorRole[] => {
   const hasSpeakerRole = creator.roles?.includes(CreatorRoles.Speaker)
   return hasSpeakerRole
      ? creator.roles
      : [...creator.roles, CreatorRoles.Speaker]
}

import useGroupsByIds from "../useGroupsByIds"

const CF_GROUP_ID = "i8NjOiRu85ohJWDuFPwo"

export const usePanelGroupsByIds = (groupIds: string[]) => {
   const filteredGroups =
      groupIds?.filter((groupId) => groupId !== CF_GROUP_ID) ?? []
   return useGroupsByIds(filteredGroups, false)
}

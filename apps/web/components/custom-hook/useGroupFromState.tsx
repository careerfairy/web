import { Group } from "@careerfairy/shared-lib/dist/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/dist/groups/GroupPresenter"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useMemo } from "react"

type Result = {
   group?: Group
   groupPresenter?: GroupPresenter
}

const useGroupFromState = (): Result => {
   const { group } = useGroup()

   return useMemo(() => {
      const res: Result = {
         group,
         groupPresenter: null,
      }

      if (group) {
         res.groupPresenter = GroupPresenter.createFromDocument(group)
      }

      return res
   }, [group])
}

export default useGroupFromState

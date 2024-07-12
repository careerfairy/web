import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import { groupSelector } from "../../store/selectors/groupSelectors"

type Result = {
   group?: Group
   groupPresenter?: GroupPresenter
}

const useGroupFromState = (): Result => {
   const group: Group = useSelector(groupSelector)

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

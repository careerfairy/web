import { GroupATSAccountDocument } from "@careerfairy/shared-lib/groups"
import { GroupATSAccount } from "@careerfairy/shared-lib/groups/GroupATSAccount"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { collection } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestore, useFirestoreCollectionData } from "reactfire"

/**
 * Fetch ATS Account Integrations from Firestore
 *
 * @param groupId
 * @param groupPresenter Optional group presenter to be hydrated
 */
const useGroupATSAccounts = (
   groupId: string,
   groupPresenter?: GroupPresenter
) => {
   const collectionRef = collection(
      useFirestore(),
      "careerCenterData",
      groupId,
      "ats"
   )

   // fetch from firestore
   const { data } = useFirestoreCollectionData<GroupATSAccountDocument>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionRef as any,
      {
         idField: "id", // this field will be added to the firestore object
      }
   )

   return useMemo(() => {
      // map to business model
      const accounts: GroupATSAccount[] = data.map((document) =>
         GroupATSAccount.createFromDocument(document)
      )

      // hydrate provided group presenter with ats data
      if (groupPresenter) {
         groupPresenter.setAtsAccounts(accounts)
      }

      return {
         data: accounts,
      }
   }, [data, groupPresenter])
}

export default useGroupATSAccounts

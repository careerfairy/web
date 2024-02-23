import { GroupATSAccountDocument } from "@careerfairy/shared-lib/dist/groups"
import { collection } from "firebase/firestore"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
import { GroupPresenter } from "@careerfairy/shared-lib/dist/groups/GroupPresenter"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import { useMemo } from "react"

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

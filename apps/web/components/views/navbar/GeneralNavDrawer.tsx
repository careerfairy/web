import React from "react"
import DrawerContent from "./DrawerContent"
import PersistentGenericDrawer from "./PersistentGenericDrawer"

interface Props {
   isPersistent?: boolean
}
const GeneralNavDrawer = ({ isPersistent }: Props) => {
   return (
      <PersistentGenericDrawer isPersistent={isPersistent}>
         <DrawerContent />
      </PersistentGenericDrawer>
   )
}

export default GeneralNavDrawer

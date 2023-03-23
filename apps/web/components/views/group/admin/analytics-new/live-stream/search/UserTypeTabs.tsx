import React from "react"
import { StyledRectangularTabs, StyledTab } from "../../../common/Tabs"
import {
   useLivestreamsAnalyticsPageContext,
   userTypes,
} from "../LivestreamAnalyticsPageProvider"

const UserTypeTabs = () => {
   const { userType, setUserType } = useLivestreamsAnalyticsPageContext()
   return (
      <StyledRectangularTabs
         onChange={(event, newValue) => {
            setUserType(newValue)
         }}
         value={userType}
      >
         {userTypes.map((type) => (
            <StyledTab key={type.value} label={type.label} value={type.value} />
         ))}
      </StyledRectangularTabs>
   )
}

export default UserTypeTabs

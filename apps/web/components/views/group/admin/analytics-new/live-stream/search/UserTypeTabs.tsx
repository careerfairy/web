import React from "react"
import { StyledRectangularTabs, StyledTab } from "../../../common/Tabs"
import {
   LivestreamUserType,
   useLivestreamsAnalyticsPageContext,
   userTypes,
} from "../LivestreamAnalyticsPageProvider"

const UserTypeTabs = () => {
   const { userType, setUserType } = useLivestreamsAnalyticsPageContext()

   const handleChange = (
      event: React.SyntheticEvent,
      newValue: LivestreamUserType
   ) => {
      setUserType(newValue)
   }

   return (
      <StyledRectangularTabs onChange={handleChange} value={userType}>
         {userTypes.map((type) => (
            <StyledTab key={type.value} label={type.label} value={type.value} />
         ))}
      </StyledRectangularTabs>
   )
}

export default UserTypeTabs

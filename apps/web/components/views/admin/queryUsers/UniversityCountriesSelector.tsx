import React, { memo } from "react"
import { UniversityCountry } from "@careerfairy/shared-lib/dist/universities"
import MultiListSelect from "../../common/MultiListSelect"
import { universityCountriesMap } from "../../../util/constants/universityCountries"
import { useUniversityCountries } from "../../../custom-hook/useCollection"

interface Props {
   setFieldValue: (field: string, value: any) => void
   value: string[]
   inputName: string
}
const allOption = { id: "select-all", name: "Any Country" }

const UniversityCountriesSelector = ({
   value,
   setFieldValue,
   inputName,
}: Props) => {
   const { data, isLoading } = useUniversityCountries()

   if (isLoading) {
      return <div>Loading..</div>
   }

   return (
      <MultiListSelect
         inputName={inputName}
         getLabelFn={getLabelFn}
         setFieldValue={setFieldValue}
         selectedItems={value}
         chipProps={{
            variant: "outlined",
         }}
         allValues={data}
         inputProps={inputProps}
         limit={5}
         selectAllOption={{
            value: allOption,
            returnValue: [],
            selectValueType: "ReturnValue",
         }}
         isCheckbox
      />
   )
}
const inputProps = {
   placeholder: "Search for a country",
   label: "User University Country",
}

const getLabelFn = (option: UniversityCountry) =>
   option.id === allOption.id
      ? "Any Country"
      : universityCountriesMap[option.id] || option.id

export default memo(UniversityCountriesSelector)

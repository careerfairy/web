import { Option } from "@careerfairy/shared-lib/dist/commonTypes"

export const formatToOptionArray = (
   selectedIds: string[],
   allOptions: Option[]
): Option[] => {
   return allOptions.filter(({ id }) => selectedIds?.includes(id))
}

export const mapOptions = (options: Option[]): string[] => {
   return options.map((option) => option.id)
}

export const multiListSelectMapValueFn = (item) => item

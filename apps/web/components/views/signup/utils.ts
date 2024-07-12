import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"

export const formatToOptionArray = (
   selectedIds: string[],
   allOptions: OptionGroup[]
): OptionGroup[] => {
   return allOptions.filter(({ id }) => selectedIds?.includes(id))
}

export const mapOptions = (options: OptionGroup[]): string[] => {
   return options.map((option) => option.id)
}

export const multiListSelectMapValueFn = (item) => item

export const multiListSelectMapIdValueFn = (item: OptionGroup) => item.id

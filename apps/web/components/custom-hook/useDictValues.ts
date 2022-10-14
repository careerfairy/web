import { useMemo } from "react"

const useDictValues = <T>(valueKeys: string[], dict: Record<string, T>) => {
   return useMemo(
      () =>
         valueKeys?.length
            ? valueKeys.map((stepId) => dict[stepId] || null)
            : Object.values(dict),
      [dict, valueKeys]
   )
}

export default useDictValues

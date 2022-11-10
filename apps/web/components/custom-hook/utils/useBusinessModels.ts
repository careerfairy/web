import { useMemo } from "react"

/**
 * Use Business Models
 * This UI hook is used to convert a plain object into its business model
 * object.
 * @param plainObjects
 * @param creationFunction The function to turn the plain object into its business model
 * */
const useBusinessModels = <BusinessModel, PlainObject extends object>(
   plainObjects: PlainObject[],
   creationFunction: (plainObject: PlainObject) => BusinessModel
): BusinessModel[] => {
   return useMemo<BusinessModel[]>(
      () => plainObjects.map(creationFunction),
      [creationFunction, plainObjects]
   )
}

export default useBusinessModels

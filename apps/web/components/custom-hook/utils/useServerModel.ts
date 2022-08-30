import { useMemo } from "react"

/**
 * Use Server Model
 * This client hook is used to Parse the serialized
 * data from the nextjs server into a business model
 * object.
 * @param serverPlainObject The serialized data from the server
 * @param creationFunction The function to turn the serialized data into business model object
 * */
const useServerModel = <T>(
   serverPlainObject: object,
   creationFunction: (field: any) => any
): T => {
   return useMemo<T>(
      () => serverPlainObject && creationFunction(serverPlainObject),
      [creationFunction, serverPlainObject]
   )
}

export default useServerModel

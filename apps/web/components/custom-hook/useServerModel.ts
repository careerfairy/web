import { useMemo } from "react"

const useServerModel = <T>(
   serverPlainObject: object,
   creationFunction: (field: any) => any
): T => {
   return useMemo<T>(
      () => creationFunction(serverPlainObject),
      [serverPlainObject]
   )
}

export default useServerModel

import { useMemo } from "react"

const useServerModel = <T>(
   serverPlainObject: object,
   creationFunction: (field: any) => any
): T => {
   return useMemo<T>(
      () => serverPlainObject && creationFunction(serverPlainObject),
      [serverPlainObject]
   )
}

export default useServerModel

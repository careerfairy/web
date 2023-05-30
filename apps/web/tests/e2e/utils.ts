export const checkIfArraysAreEqual = (
   arr1: string[],
   arr2: string[]
): [boolean, string, string] => {
   const firstStringArray = [...arr1].sort().toString()
   const secondStringArray = [...arr2].sort().toString()
   return [
      firstStringArray === secondStringArray,
      firstStringArray,
      secondStringArray,
   ]
}

export const sleep = (ms: number) => {
   return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Tries several times to get data from a promise
 *
 * Example use-case: read firestore documents and wait for them to be created
 */
export const waitForData = async <T>(
   promiseFn: () => Promise<T>,
   tries = 10,
   intervalMs = 500
): Promise<ReturnType<typeof promiseFn>> => {
   while (tries-- > 0) {
      try {
         let result = await promiseFn()

         if (result) {
            return result
         }
      } catch (e) {
         console.error(e)
      }
      await sleep(intervalMs)
   }

   throw new Error("Max tries exceeded")
}

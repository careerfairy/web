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

export const sleep = (ms) => {
   return new Promise((resolve) => setTimeout(resolve, ms))
}

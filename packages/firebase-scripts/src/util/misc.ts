export const removeDuplicates = (arr: string[]) => {
   return Array.from(new Set(arr))
}

export const getCLIBarOptions = (
   title: string = "CLI Progress",
   operationName: string = "operations"
) => {
   return {
      format: `${title} |{bar}| {percentage}% || {value}/{total} ${operationName} || ETA: {eta_formatted}`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
   }
}

export const checkIfHasMatch = (
   questionName: string,
   possibleNames: string[]
) => {
   return possibleNames
      .map((name) => trimAndLowerCase(name))
      .includes(trimAndLowerCase(questionName))
}

export const trimAndLowerCase = (str: string) => {
   return str.trim().toLowerCase()
}

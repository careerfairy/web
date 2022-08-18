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
   const trimmedQuestionName = trimAndLowerCase(questionName)
   const trimmedPossibleNames = possibleNames.map(trimAndLowerCase)
   return (
      // check to see if question name is in possible names
      trimmedPossibleNames.includes(trimmedQuestionName) ||
      // check to see if any of the possible
      // names is a subset of the question name
      trimmedPossibleNames.some((possibleName) =>
         trimmedQuestionName.includes(possibleName)
      )
   )
}

export const trimAndLowerCase = (str: string) => {
   return str.trim().toLowerCase()
}

export const throwMigrationError = (message: string) => {
   throw new Error(`Migration canceled, Error Message: ${message}`)
}

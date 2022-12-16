import { v4 as uuidv4 } from "uuid"

export const capitalizeFirstLetter = (string: string) => {
   return string.charAt(0).toUpperCase() + string.slice(1)
}
export const getRandomInt = (max: number) => {
   let variable = Math.floor(Math.random() * Math.floor(max))
   if (variable < 1000) {
      return variable + 1000
   } else {
      return variable
   }
}

/**
 * Generate a Unique ID
 *
 * The generated is sometimes used as an ID for DOM element, thus we need
 * to have some considerations in mind:
 * - starts with a letter (i)
 * - doesn't contain dashes
 */
export const generateId = () => {
   return `i${uuidv4().replace(/-/g, "")}`
}

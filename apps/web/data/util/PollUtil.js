/**
 * Convert Poll Options Object To An Array of options
 * @param {object} pollOptionsObject - Takes in an options dictionary
 * @return {array} Return the converted dictionary into an array of objects
 */
export const convertPollOptionsObjectToArray = (pollOptionsObject) => {
   return Object.keys(pollOptionsObject).map((key) => ({
      ...pollOptionsObject[key],
      index: key,
   }))
}

/**
 * Convert Poll Options Object To An Array of options
 * @param {([string])} arrayOfPollOptionNames - Takes an array of poll option names
 * @return {({name: string, votes: number, voters: array, index: number})} Returns the converted array of option names into a dictionary
 */
export const convertPollOptionNamesArrayToObject = (
   arrayOfPollOptionNames = []
) => {
   return Object.assign(
      {},
      ...arrayOfPollOptionNames.map((option, index) => ({
         [index]: {
            name: option,
            votes: 0,
            voters: [],
            index,
         },
      }))
   )
}

/**
 * Get the correct Poll options data format
 * @param {({options: (([{id: string, text: string}]) || Object)})} pollData - Takes the poll document data
 * @return {Array|Object|*[]} Makes sure it returns the options as an array,
 * TODO make it convert a dictionary of options into an array of objects with the shape ({id: string, text: string})
 */
export const getCorrectPollOptionData = (pollData) => {
   return pollData.options.length ? pollData.options : []
}

export default {
   getCorrectPollOptionData,
   convertPollOptionsObjectToArray,
   convertPollOptionNamesArrayToObject,
}

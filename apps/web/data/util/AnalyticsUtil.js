export const mapUserEngagement = (user, streams) => {
   let categoryUser = {
      ...user,
      levelOfStudy: {
         ...user.levelOfStudy,
         name: user.levelOfStudy?.name || null,
         id: user.levelOfStudy?.id || null,
      },
      fieldOfStudy: {
         ...user.fieldOfStudy,
         name: user.fieldOfStudy?.name || null,
         id: user.fieldOfStudy?.id || null,
      },
   }
   categoryUser.watchedEvent = false
   const registeredStreams = []
   const watchedStreams = []

   const currentUserEmail = categoryUser.userEmail

   if (currentUserEmail) {
      streams.forEach((stream) => {
         if (
            stream?.participatingStudents?.some(
               (userEmail) => userEmail === currentUserEmail
            )
         ) {
            watchedStreams.push(stream)
            categoryUser.watchedEvent = true
         }
         if (
            stream?.registeredUsers?.some(
               (userEmail) => userEmail === currentUserEmail
            )
         ) {
            registeredStreams.push(stream)
         }
      })
   }
   categoryUser.numberOfStreamsWatched = watchedStreams.length
   categoryUser.streamsWatched = watchedStreams
   categoryUser.numberOfStreamsRegistered = registeredStreams.length
   categoryUser.streamsRegistered = registeredStreams
   return categoryUser
}

export const mergeArrayOfUsers = (arr1, arr2) => {
   const hash = new Map()
   arr1.concat(arr2).forEach(function (obj) {
      hash.set(obj.userEmail, Object.assign(hash.get(obj.userEmail) || {}, obj))
   })
   return Array.from(hash.values())
}

export const getTotalUniqueIds = (streams = [], hiddenStreamIds = {}) => {
   const totalIds = streams.reduce((mainAcc, stream) => {
      if (hiddenStreamIds?.[stream.id]) return mainAcc
      const filteredStreamUserSets = [
         stream.participatingStudents,
         stream.registeredUsers,
         stream.talentPool,
      ].filter((userSet) => userSet?.length)
      const ids = filteredStreamUserSets.reduce(
         (acc, curr) => [...acc, ...curr],
         []
      )
      return [...mainAcc, ...ids]
   }, [])
   return [...new Set(totalIds)]
}

export const convertArrayOfUserObjectsToDictionary = (arrayOfUsers) => {
   return Object.assign(
      {},
      ...arrayOfUsers.map((user) => ({ [user.userEmail]: user }))
   )
}

export const convertArrayOfObjectsToDictionaryByProp = (
   arrayOfObjects,
   prop
) => {
   return Object.assign(
      {},
      ...arrayOfObjects.map((obj) => ({ [obj[prop]]: obj }))
   )
}

export const getTotalEmailsFromStreamsByProperty = (streamsArray, prop) => {
   return streamsArray.reduce(
      (accumulator, livestream) =>
         livestream?.[prop]?.length
            ? accumulator.concat(livestream[prop])
            : accumulator,
      []
   )
}

export const getUniqueIds = (arrayOfIds) => {
   return [...new Set(arrayOfIds)]
}

export const getUniqueUsers = (streamsArray, prop) => {
   const totalViewers = getTotalEmailsFromStreamsByProperty(streamsArray, prop)
   // new Set method removes all duplicates from array
   return totalViewers.filter(function (el) {
      if (!this[el.userEmail]) {
         this[el.userEmail] = true
         return true
      }
      return false
   }, Object.create(null))
}

export const getUniqueUsersByEmailWithArrayOfUsers = (ArrayOfUsers = []) => {
   return ArrayOfUsers.filter(function (el) {
      if (!this[el.userEmail]) {
         this[el.userEmail] = true
         return true
      }
      return false
   }, Object.create(null))
}

export const getTotalUniqueStreamGroupIdsFromStreams = (
   arrayOfStreams = []
) => {
   const totalIds = arrayOfStreams.reduce(
      (acc, curr) => (curr.groupIds ? acc.concat(curr.groupIds) : acc),
      []
   )
   return [...new Set(totalIds)]
}

export const arraysOfIdsEqual = (array1, array2) => {
   if (array1 === array2) return true
   if (array1 == null || array2 == null) return false
   if (array1.length !== array2.length) return false

   const array1Sorted = [...array1].sort()
   const array2Sorted = [...array2].sort()

   // If you don't care about the order of the elements inside
   // the array, you should sort both arrays here.
   // Please note that calling sort on an array will modify that array.
   // you might want to clone your array first.

   for (let i = 0; i < array1Sorted.length; ++i) {
      if (array1Sorted[i] !== array2Sorted[i]) return false
   }
   return true
}

const getUsersFromDictionaryWithIds = (arrayOfIds = [], dictionary = {}) => {
   return arrayOfIds.reduce((acc, id) => {
      if (!dictionary?.[id]) return acc
      return acc.concat(dictionary[id])
   }, [])
}

export const checkIfInTalentPool = (livestream, userId) => {
   return Boolean(livestream?.talentPool?.includes(userId))
}

export const insertIf = (condition, ...elements) => {
   return condition ? elements : []
}
export default {
   mapUserEngagement,
   getUniqueIds,
   getTotalEmailsFromStreamsByProperty,
   getUniqueUsers,
   mergeArrayOfUsers,
   convertArrayOfUserObjectsToDictionary,
   getTotalUniqueIds,
   getTotalUniqueStreamGroupIdsFromStreams,
   arraysOfIdsEqual,
   getUniqueUsersByEmailWithArrayOfUsers,
   convertArrayOfObjectsToDictionaryByProp,
   getUsersFromDictionaryWithIds,
   checkIfInTalentPool,
   insertIf,
}

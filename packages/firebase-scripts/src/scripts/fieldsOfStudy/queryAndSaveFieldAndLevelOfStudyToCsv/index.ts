import { firestore } from "../../../lib/firebase"
import { Group, GroupOption } from "@careerfairy/shared-lib/dist/groups"
import {
   possibleFieldsOfStudy,
   possibleLevelsOfStudy,
} from "../../../constants"
const ObjectsToCsv = require("objects-to-csv")
type DataEntry = {
   // Name of category Option
   name: string
   // Number of time the option name is used across all groups
   count: number
}

export async function run() {
   try {
      const snaps = await firestore.collection("careerCenterData").get()

      // get all fields of study

      const data = snaps.docs.reduce<{
         fieldOfStudies: DataEntry[]
         levelOfStudies: DataEntry[]
      }>(
         (acc, currDoc) => {
            const data = currDoc.data() as Group
            const categories = data.categories

            const findCategoryOptions = (
               possiblePropertyNames: string[]
            ): GroupOption[] => {
               return (
                  categories?.reduce((acc, currCategory) => {
                     if (
                        possiblePropertyNames.includes(
                           lowerCaseAndTrim(currCategory.name)
                        )
                     ) {
                        return [...acc, ...currCategory.options]
                     }
                     return acc
                  }, []) || null
               )
            }

            const getAndSortOptionNames = (
               categoryOptions: GroupOption[],
               optionsArray: DataEntry[]
            ) => {
               const newOptionsArray = [...optionsArray]
               if (categoryOptions) {
                  categoryOptions.forEach((option) => {
                     const optionName = lowerCaseAndTrim(option.name)
                     const optionIndex = newOptionsArray.findIndex(
                        (optionObj) =>
                           lowerCaseAndTrim(optionObj.name) === optionName
                     )
                     if (optionIndex > -1) {
                        newOptionsArray[optionIndex].count += 1
                     } else {
                        newOptionsArray.push({ name: optionName, count: 1 })
                     }
                  })
               }
               return newOptionsArray.sort((a, b) => b.count - a.count)
            }

            const fieldOfStudiesCat = findCategoryOptions(
               possibleFieldsOfStudy.map(lowerCaseAndTrim)
            )
            const levelOfStudiesCat = findCategoryOptions(
               possibleLevelsOfStudy.map(lowerCaseAndTrim)
            )

            const sortedAndCountedFieldsOfStudy = getAndSortOptionNames(
               fieldOfStudiesCat,
               acc.fieldOfStudies
            )
            const sortedAndCountedLevelsOfStudy = getAndSortOptionNames(
               levelOfStudiesCat,
               acc.levelOfStudies
            )

            return {
               fieldOfStudies: sortedAndCountedFieldsOfStudy,
               levelOfStudies: sortedAndCountedLevelsOfStudy,
            }
         },
         { fieldOfStudies: [], levelOfStudies: [] }
      )

      const fieldsOfStudyCsv = new ObjectsToCsv(data.fieldOfStudies)
      const levelsOfStudyCsv = new ObjectsToCsv(data.levelOfStudies)

      await Promise.all([
         fieldsOfStudyCsv.toDisk(
            `./Fields of Study - ${new Date().getMilliseconds()}.csv`
         ),
         levelsOfStudyCsv.toDisk(
            `./Levels of Study - ${new Date().getMilliseconds()}.csv`
         ),
      ])
      console.log(`-> Done! CVSs saved at packages\\firebase-scripts`)
   } catch (e) {
      console.error(e)
   }
}

const lowerCaseAndTrim = (str: string) => str.toLowerCase().trim()

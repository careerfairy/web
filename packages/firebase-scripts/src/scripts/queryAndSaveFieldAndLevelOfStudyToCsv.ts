import { firestore } from "../lib/firebase"
import { Group, GroupOption } from "@careerfairy/shared-lib/dist/groups"
const ObjectsToCsv = require("objects-to-csv")

type DataEntry = {
   // Name of category Option
   name: string
   // Number of time the option name is used across all groups
   count: number
}

export default async function run() {
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
            const possibleFieldsOfStudy = [
               "Field of Study",
               "Field of study",
               "field of study",
               "Field Of Study",
               "Fachrichtung",
               "Field of Work",
               "Domaine d'études",
               "What is your field of study?",
               "Domaine d'étude",
               "Study Field",
               "Domain of study",
               "Field of study ",
            ]
            const possibleLevelsOfStudy = [
               "Level of Study",
               "Level of study",
               "level of study",
               "Level Of Study",
               "lvl of study",
               "Lvl of Study",
               "Lvl Of Study",
               "Niveau d'études",
               "What is your current level of study?",
               "Study Level",
               "Level of studies",
            ]

            const findCategoryOptions = (
               possiblePropertyNames: string[]
            ): GroupOption[] => {
               return (
                  categories?.reduce((acc, currCategory) => {
                     if (possiblePropertyNames.includes(currCategory.name)) {
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
                     const optionName = option.name.toLowerCase()
                     const optionIndex = newOptionsArray.findIndex(
                        (optionObj) => optionObj.name === optionName
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

            const fieldOfStudiesCat = findCategoryOptions(possibleFieldsOfStudy)
            const levelOfStudiesCat = findCategoryOptions(possibleLevelsOfStudy)

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

      const dateTime = `${new Date().toDateString()} ${new Date()
         .toTimeString()
         .split(" ")[0]
         .replace(":", "-")}`

      await Promise.all([
         fieldsOfStudyCsv.toDisk(`./Fields of Study - ${dateTime}.csv`),
         levelsOfStudyCsv.toDisk(`./Levels of Study - ${dateTime}.csv`),
      ])
      console.log(`-> Done! CVSs saved at packages\\firebase-scripts`)
   } catch (e) {
      console.error(e)
   }
}

import csvToData from "../util/csvToData"
import config from "../config"
import * as fs from "fs"

// Fos = Field of Study
// Los = Level of Study
export const saveFieldAndLevelOfStudyMappingsToJson =
   async (): Promise<void> => {
      const currentFosHeaderValue = "CF FIELD OF STUDY NAME"
      const currentFosHeaderKey = "CF FIELD OF STUDY ID"
      const legacyFosHeaderKey = "FIELD OF STUDY NAME"
      const legacyFosHeaderValue = "CF FIELD OF STUDY RELATED ID"
      const currentLosHeaderValue = "CF LEVEL OF STUDY NAME"
      const currentLosHeaderKey = "CF LEVEL OF STUDY ID"
      const legacyLosHeaderKey = "LEVEL OF STUDY NAME"
      const legacyLosHeaderValue = "CF LEVEL OF STUDY RELATED ID"
      const data = await csvToData(config.exportedFieldAndLevelOfStudyMapping)
      const currentFosDict = getDictionary(
         data,
         currentFosHeaderKey,
         currentFosHeaderValue
      )
      const legacyFosDict = getDictionary(
         data,
         legacyFosHeaderKey,
         legacyFosHeaderValue
      )
      const currentLosDict = getDictionary(
         data,
         currentLosHeaderKey,
         currentLosHeaderValue
      )
      const legacyLosDict = getDictionary(
         data,
         legacyLosHeaderKey,
         legacyLosHeaderValue
      )
      const fieldOfStudyMapping = {
         current: currentFosDict,
         legacy: legacyFosDict,
      }
      const levelOfStudyMapping = {
         current: currentLosDict,
         legacy: legacyLosDict,
      }

      const dataToWrite = JSON.stringify({
         fieldOfStudyMapping,
         levelOfStudyMapping,
      })

      fs.writeFile(
         config.fieldAndLevelOfStudyMappingJsonPath,
         dataToWrite,
         "utf8",
         () => console.log("fieldAndLevelOfStudyMappingJsonPath.json saved")
      )
   }

const getDictionary = (data: any[], headerKey: string, headerValue) => {
   const dict = {}
   for (const row of data) {
      if (row[headerKey] && row[headerValue]) {
         dict[row[headerKey]] = row[headerValue]
      }
   }
   return dict
}

export default saveFieldAndLevelOfStudyMappingsToJson

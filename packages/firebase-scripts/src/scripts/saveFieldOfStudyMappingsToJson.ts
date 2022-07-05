import csvToData from "../util/csvToData"
var fs = require("fs")
import config from "../config"

export const saveFieldOfStudyMappingsToJson = async (): Promise<void> => {
   const currentHeaderValue = "CF Field of Study Name"
   const currentHeaderKey = "CF Field of Study ID"
   const legacyHeaderKey = "name"
   const legacyHeaderValue = "CF Field of Study Related ID"
   const data = await csvToData(config.exportedFieldOfStudyMappingCsv)
   const currentFieldOfStudiesDict = getDictionary(
      data,
      currentHeaderKey,
      currentHeaderValue
   )
   const legacyFieldOfStudiesDict = getDictionary(
      data,
      legacyHeaderKey,
      legacyHeaderValue
   )

   const fieldOfStudyMapping = {
      legacyMappings: legacyFieldOfStudiesDict,
      newFieldOfStudies: currentFieldOfStudiesDict,
   }

   fs.writeFile(
      config.fieldOfStudyMappingJsonPath,
      JSON.stringify(fieldOfStudyMapping),
      "utf8",
      () => console.log("fieldOfStudyMappingJsonPath.json saved")
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

export default saveFieldOfStudyMappingsToJson

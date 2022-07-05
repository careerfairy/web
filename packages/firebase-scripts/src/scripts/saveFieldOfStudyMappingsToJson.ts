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

   fs.writeFile(
      config.currentFieldOfStudiesMappingJsonPath,
      JSON.stringify(currentFieldOfStudiesDict),
      "utf8",
      () => console.log("currentFieldOfStudiesDict.json saved")
   )
   fs.writeFile(
      config.legacyFieldOfStudiesMappingJsonPath,
      JSON.stringify(legacyFieldOfStudiesDict),
      "utf8",
      () => console.log("legacyFieldOfStudiesDict.json saved")
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

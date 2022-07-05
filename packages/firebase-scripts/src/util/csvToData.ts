const csv = require("csvtojson")

const csvToData = async (csvFilePath: string, delimiter = ",") => {
   return csv({ delimiter }).fromFile(csvFilePath)
}
export default csvToData

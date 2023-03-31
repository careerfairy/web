import { prettyLocalizedDate } from "../../../../../helperFunctions/HelperFunctions"
import { UserDataEntry } from "./UserLivestreamDataTable"

export const handleDownloadPDF = async (url: string, fileName: string) => {
   return fetch(url)
      .then((resp) => resp.arrayBuffer())
      .then((resp) => {
         // set the blob type to final pdf
         const file = new Blob([resp], { type: "application/pdf" })
         // process to auto download it
         const fileURL = URL.createObjectURL(file)
         const link = document.createElement("a")
         link.href = fileURL
         link.download = fileName + new Date() + ".pdf"
         link.click()
      })
}

export const getFileName = (userData: UserDataEntry) =>
   `${userData.firstName} ${userData.lastName} CV - ${prettyLocalizedDate(
      new Date()
   )}`

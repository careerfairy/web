import { prettyLocalizedDate } from "../../../../../helperFunctions/HelperFunctions"
import { UserData } from "@careerfairy/shared-lib/users"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"

export const handleDownloadPDF = async (url: string, fileName: string) => {
   return fetch(url)
      .then((resp) => resp.arrayBuffer())
      .then((resp) => {
         // set the blog type to final pdf
         const file = new Blob([resp], { type: "application/pdf" })
         // process to auto download it
         const fileURL = URL.createObjectURL(file)
         const link = document.createElement("a")
         link.href = fileURL
         link.download = fileName + new Date() + ".pdf"
         link.click()
      })
}

export const getFileName = (userData: UserData) =>
   `${userData.firstName} ${userData.lastName} CV - ${prettyLocalizedDate(
      new Date()
   )}`

/*
 * Some old UserLivestreamData documents have deprecated fields that are strings instead of objects.
 * This causes the table to crash, so we need to sanitize the data before rendering it.
 * */
export const sanitizeUserLivestreamData = (
   data: UserLivestreamData[]
): UserLivestreamData[] => {
   return (
      data?.map((d) => ({
         ...d,
         user: {
            ...d.user,
            levelOfStudy:
               typeof d.user.levelOfStudy === "string"
                  ? null
                  : d.user.levelOfStudy,
            fieldOfStudy:
               typeof d.user.fieldOfStudy === "string"
                  ? null
                  : d.user.fieldOfStudy,
         },
      })) ?? []
   )
}

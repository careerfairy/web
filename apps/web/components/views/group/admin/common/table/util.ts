import { getDocs, Query } from "@firebase/firestore"
import JSZip from "jszip"
import { CSVData } from "../../../../../custom-hook/useMetaDataActions"
import { prettyLocalizedDate } from "../../../../../helperFunctions/HelperFunctions"
import { UserDataEntry } from "./UserLivestreamDataTable"

export type DownloadData = {
   url: string
   fileName: string
}

export const handleDownloadPDF = async (url: string, fileName: string) => {
   const resp = await fetch(url)
   const blobParts: ArrayBuffer = await resp.arrayBuffer()
   // set the blob type to final pdf
   const file = new Blob([blobParts], { type: "application/pdf" })
   // process to auto download it
   const fileURL = URL.createObjectURL(file)
   const link = document.createElement("a")
   link.href = fileURL
   link.download = fileName + new Date() + ".pdf"
   link.click()
}

export const batchPDFDownload = async (
   arrayOfDownloadData: DownloadData[],
   zipFileName: string
): Promise<void> => {
   const zip = new JSZip()
   const linkElement = document.createElement("a")

   const request = async ({ url, fileName }: DownloadData) => {
      const resp = await fetch(url)
      const buffer = await resp.arrayBuffer()
      const file = new Blob([buffer], { type: "application/pdf" })
      zip.file(`${makeFileNameWindowsFriendly(fileName)}.pdf`, file)
   }

   await Promise.all(
      arrayOfDownloadData.map((data) => {
         return request(data)
      })
   )

   const content = await zip.generateAsync({ type: "blob" })

   linkElement.download = makeFileNameWindowsFriendly(zipFileName)
   linkElement.href = URL.createObjectURL(content)
   linkElement.innerHTML = "download " + linkElement.download
   linkElement.click()
}

export const getAllUsers = async (
   fullQuery: Query,
   converterFn: (unknown) => UserDataEntry
) => {
   const snapshot = await getDocs(fullQuery)
   return snapshot.docs.map((doc) => converterFn(doc.data()))
}

export const getFileName = (userData: UserDataEntry) =>
   `${userData.firstName} ${userData.lastName} CV - ${prettyLocalizedDate(
      new Date()
   )}`

export const makeFileNameWindowsFriendly = (string: string): string => {
   return string.replace(/[/*|:<>?"\\]/gi, "_")
}

const userDataEntryColumnMapper: Record<
   Exclude<keyof UserDataEntry, "preRegAnswers">,
   string
> = {
   firstName: "First Name",
   lastName: "Last Name",
   email: "Email",
   fieldOfStudy: "Field of Study",
   levelOfStudy: "Level of Study",
   universityName: "University Name",
   universityCountryName: "University Country",
   universityCountryCode: "University Country Code",
   resumeUrl: "Resume URL",
   linkedInUrl: "LinkedIn URL",
   avatar: "Avatar url",
}

export const getCSVDialogData = (
   users: UserDataEntry[],
   title: string
): {
   title: string
   data: CSVData
} => {
   // Collect dynamic question columns from all users
   const dynamicQuestionTitles = Array.from(
      new Set(
         users
            .flatMap((u) => Object.keys(u.preRegAnswers || {}))
            .filter(Boolean)
      )
   )

   return {
      title: title,
      data: users.map((user) => {
         const baseEntries = Object.keys(userDataEntryColumnMapper).map(
            (key) => ({
               title: userDataEntryColumnMapper[key],
               value: user[key],
            })
         )

         const questionEntries = dynamicQuestionTitles.map((questionTitle) => ({
            title: questionTitle,
            value: user.preRegAnswers?.[questionTitle] || "",
         }))

         const allEntries = [...baseEntries, ...questionEntries]

         return allEntries.reduce((a, v) => ({ ...a, [v.title]: v.value }), {})
      }),
   }
}

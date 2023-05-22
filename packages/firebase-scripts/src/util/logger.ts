import { appendLineToFile } from "./fs"

/**
 * Log the action duration before and after
 */
export const logAction = async <T>(
   callback: () => Promise<T>,
   title: string
): Promise<T> => {
   const startTime = Date.now()
   console.log(`Starting ${title}`)

   const result = await callback()

   const seconds = (Date.now() - startTime) / 1000
   console.log(`Finished ${title} in ${seconds}s.`)

   return result
}

/**
 * Log data to a file, new lines are appended to the file
 *
 * File will be created if it doesn't exist
 */
export const logToFile = async (path: string, data: object) => {
   const entry = JSON.stringify({
      date: new Date().toISOString(),
      ...data,
   })

   await appendLineToFile(path, entry)
}

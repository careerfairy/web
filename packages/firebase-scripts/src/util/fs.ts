import { promises as fs } from "fs"

/**
 * Appends a line to a file, creates the file if it doesn't exist
 *
 * Useful to save migration entries in a file for later inspection
 *
 * @param path The path of the file to append to
 * @param line The line to append to the file
 * @returns A Promise that resolves when the line has been appended
 */
export async function appendLineToFile(
   path: string,
   line: string
): Promise<void> {
   try {
      // check if file exists
      await fs.access(path)
   } catch {
      // create file if it doesn't exist
      await fs.writeFile(path, "")
   }

   // append line to file
   await fs.appendFile(path, line + "\n")
}

// remove file if it exists
export async function removeFile(path: string): Promise<void> {
   try {
      await fs.unlink(path)
   } catch (e) {
      // file doesn't exist
   }
}

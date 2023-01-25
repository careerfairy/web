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

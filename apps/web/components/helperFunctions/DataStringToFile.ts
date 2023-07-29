/**
 * Convert data URL to file object.
 *
 * @param {string} dataurl - The data URL.
 * @param {string} filename - The name of the file.
 *
 * @returns {File} - The file object.
 */
const dataURLtoFile = (dataurl: string, filename: string): File => {
   // Split the data URL into two parts: the data type and the data itself
   let arr = dataurl.split(","),
      // Extract the MIME type (e.g., 'image/png') from the data type
      mime = arr[0].match(/:(.*?);/)[1],
      // Convert the base64-encoded data to a string
      bstr = atob(arr[1]),
      // Get the length of the data
      n = bstr.length,
      // Initialize a typed array with the same length as the data
      u8arr = new Uint8Array(n)

   // Fill the typed array with the data
   while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
   }

   // Return a new File object using the typed array and the MIME type
   return new File([u8arr], filename, { type: mime })
}
export default dataURLtoFile

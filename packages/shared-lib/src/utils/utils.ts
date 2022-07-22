export const getNestedProperty = (obj: any, path: string, separator = ".") => {
   const properties = Array.isArray(path) ? path : path.split(separator)
   return properties.reduce((prev, curr) => prev && prev[curr], obj)
}
export const dynamicSort = <T>(property: keyof T, order?: "asc" | "desc") => {
   let sortOrder = 1
   if (order === "desc") {
      sortOrder = -1
   }
   return function (a: T, b: T) {
      if (a[property] < b[property]) {
         return -1 * sortOrder
      }
      if (a[property] > b[property]) {
         return sortOrder
      }
      return 0
   }
}

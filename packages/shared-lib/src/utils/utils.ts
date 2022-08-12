/*
 *
 * Method gets a nested property based on a string path
 *  - const obj = {prop1: {prop2:{prop3: "dog"}}}
 *  - getNestedProperty(obj, "prop1.prop2.prop3") returns "dog"
 * */
export const getNestedProperty = (obj: any, path: string, separator = ".") => {
   const properties = Array.isArray(path) ? path : path.split(separator)
   return properties.reduce((prev, curr) => prev && prev[curr], obj)
}
/**
 * @description
 * - Returns a function which will sort an
 * array of objects by the given key.
 * - [{id: 3}, {id: 1}, {id: 2}].sort(dynamicSort("id", "desc"))
 * - returns [{id: 3}, {id: 2}, {id: 1}]
 *
 * @param  {String}  property
 * @param  {"asc" | "desc"} order
 * @return {Function}
 */
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

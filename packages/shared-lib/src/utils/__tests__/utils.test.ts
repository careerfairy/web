import { getNestedProperty } from "../utils"

const obj = { prop1: { prop2: { prop3: "dog" } } }

test("getNestedProperty should return correct nested property via path string", () => {
   expect(getNestedProperty(obj, "prop1.prop2.prop3")).toBe("dog")
})

test("getNestedProperty should return correct nested property via array path", () => {
   expect(getNestedProperty(obj, ["prop1", "prop2", "prop3"])).toBe("dog")
})

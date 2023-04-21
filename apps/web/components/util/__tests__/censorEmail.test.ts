import censorEmail from "../censorEmail"

describe("censorEmail", () => {
   it("censors the email correctly", () => {
      expect(censorEmail("john.doe@example.com")).toEqual("joh*****")
      expect(censorEmail("jane@example.com")).toEqual("jan*")
      expect(censorEmail("user12345@example.com")).toEqual("use******")
   })
})

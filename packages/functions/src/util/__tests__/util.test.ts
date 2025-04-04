import {
   handleDocumentUpdateError,
   handleDocumentUpdateErrors,
} from "../../util"

describe("Document Update Error Handlers: Util function handleDocumentUpdateError", () => {
   test("should only catch specified error codes", async () => {
      // arrange
      const notFoundError = new Error("NOT_FOUND")
      notFoundError["code"] = "5"

      const permissionError = new Error("PERMISSION_DENIED")
      permissionError["code"] = "7"

      const errorHandler = jest.fn()

      // act & assert - single error code
      await expect(
         handleDocumentUpdateError(
            Promise.reject(notFoundError),
            "5",
            errorHandler
         )
      ).resolves.toBeUndefined()
      expect(errorHandler).toHaveBeenCalledWith(["5"], notFoundError)

      // act & assert - array of error codes
      await expect(
         handleDocumentUpdateError(
            Promise.reject(permissionError),
            ["5", "7"],
            errorHandler
         )
      ).resolves.toBeUndefined()
      expect(errorHandler).toHaveBeenCalledWith(["5", "7"], permissionError)

      // Should throw for unspecified error code
      const otherError = new Error("OTHER")
      otherError["code"] = "9"
      await expect(
         handleDocumentUpdateError(
            Promise.reject(otherError),
            "5",
            errorHandler
         )
      ).rejects.toEqual(otherError)
   })

   test("should handle array of promises and only catch specified errors", async () => {
      // arrange
      const notFoundError = new Error("NOT_FOUND")
      const permissionError = new Error("PERMISSION_DENIED")
      const otherError = new Error("OTHER")

      notFoundError["code"] = "5"
      permissionError["code"] = "7"
      otherError["code"] = "9"

      const promises = [
         Promise.reject(notFoundError),
         Promise.resolve("success"),
         Promise.reject(permissionError),
         Promise.reject(otherError),
      ]

      const errorHandler = jest.fn()

      // act
      const results = handleDocumentUpdateErrors(
         promises,
         ["5", "7"],
         errorHandler
      )

      // assert
      await expect(results[0]).resolves.toBeUndefined() // notFoundError should be caught
      await expect(results[1]).resolves.toBe("success") // success should pass through
      await expect(results[2]).resolves.toBeUndefined() // permissionError should be caught
      await expect(results[3]).rejects.toEqual(otherError) // otherError should be thrown

      expect(errorHandler).toHaveBeenCalledTimes(2)
      expect(errorHandler).toHaveBeenCalledWith(["5", "7"], notFoundError)
      expect(errorHandler).toHaveBeenCalledWith(["5", "7"], permissionError)
   })

   test("should throw when no error codes match", async () => {
      // arrange
      const error1 = new Error("ERROR_1")
      const error2 = new Error("ERROR_2")

      error1["code"] = "8"
      error2["code"] = "9"

      const promises = [Promise.reject(error1), Promise.reject(error2)]

      const errorHandler = jest.fn()

      // act
      const results = handleDocumentUpdateErrors(
         promises,
         ["5", "7"],
         errorHandler
      )

      // assert
      await expect(results[0]).rejects.toEqual(error1)
      await expect(results[1]).rejects.toEqual(error2)
      expect(errorHandler).not.toHaveBeenCalled()
   })
})

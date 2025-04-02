// import { FirestoreErrorCodeMap, handleDocumentUpdateError, handleDocumentUpdateErrors } from "../../util"

// test("hanFirestoreErrorCodeMap, dleDocumentUpdateError should trigger the error handler only for the rejected promise that matches the error code", async () => {
//     // Mock error handler
//     const errorHandler = jest.fn()

//     // Create a promise that rejects with a Firestore error
//     const notFoundError = { code: 5, message: "Document not found" }
//     const updatePromise = Promise.reject(notFoundError)

//     // Test handling NOT_FOUND error
//     await handleDocumentUpdateError(updatePromise, "NOT_FOUND", errorHandler)
//     expect(errorHandler).toHaveBeenCalledWith([FirestoreErrorCodeMap.NOT_FOUND], notFoundError)

//     // Test that other errors are thrown
//     const permissionError = { code: 7, message: "Permission denied" }
//     const updatePromise2 = Promise.reject(permissionError)

//     await expect(
//         handleDocumentUpdateError(updatePromise2, "NOT_FOUND", errorHandler)
//     ).rejects.toEqual(permissionError)
// })

// test("handleDocumentUpdateErrors should handle multiple promises and their errors correctly", async () => {
//     // Mock error handler
//     const errorHandler = jest.fn()

//     // Create test promises
//     const notFoundError = { code: 5, message: "Document not found" }
//     const permissionError = { code: 7, message: "Permission denied" }
//     const otherError = { code: 1, message: "Other error" }

//     const promises = [
//         Promise.reject(notFoundError),
//         Promise.reject(permissionError),
//         Promise.reject(otherError)
//     ]

//     // Test handling multiple error codes
//     const results = handleDocumentUpdateErrors(
//         promises,
//         ["NOT_FOUND", "PERMISSION_DENIED"],
//         errorHandler
//     )

//     // Wait for all promises to settle
//     await Promise.allSettled(results)

//     // Error handler should be called twice (for NOT_FOUND and PERMISSION_DENIED)
//     expect(errorHandler).toHaveBeenCalledTimes(2)
//     expect(errorHandler).toHaveBeenCalledWith(
//         [FirestoreErrorCodeMap.NOT_FOUND, FirestoreErrorCodeMap.PERMISSION_DENIED],
//         notFoundError
//     )
//     expect(errorHandler).toHaveBeenCalledWith(
//         [FirestoreErrorCodeMap.NOT_FOUND, FirestoreErrorCodeMap.PERMISSION_DENIED],
//         permissionError
//     )

//     // The other error should be thrown
//     await expect(results[2]).rejects.toEqual(otherError)
// })

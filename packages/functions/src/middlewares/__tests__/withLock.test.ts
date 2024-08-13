import { logger } from "firebase-functions/v2"
import { firestore } from "../../api/firestoreAdmin"
import { withLock } from "../withLock"

jest.mock("../../api/firestoreAdmin")
jest.mock("firebase-functions/v2")

describe("withLock", () => {
   let mockFn: jest.Mock
   let mockReq: any
   let mockRes: any
   let mockTransaction: any
   let mockLockRef: any

   beforeEach(() => {
      mockFn = jest.fn()
      mockReq = {}
      mockRes = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      }
      mockTransaction = {
         get: jest.fn(),
         set: jest.fn(),
      }
      mockLockRef = {
         set: jest.fn(),
      }
      ;(firestore.runTransaction as jest.Mock).mockImplementation((callback) =>
         callback(mockTransaction)
      )
      ;(firestore.collection as jest.Mock).mockReturnValue({
         doc: jest.fn().mockReturnValue(mockLockRef),
      })
   })

   it("should acquire lock and execute function when lock is available", async () => {
      mockTransaction.get.mockResolvedValue({ exists: false })

      const wrappedFn = withLock({ lockName: "testLock" })(mockFn)
      await wrappedFn(mockReq, mockRes)

      expect(mockFn).toHaveBeenCalled()
      expect(mockLockRef.set).toHaveBeenCalledWith(
         { locked: false, lockedAt: null },
         { merge: true }
      )
   })

   it("should not execute function when lock is already held", async () => {
      mockTransaction.get.mockResolvedValue({
         exists: true,
         data: () => ({ locked: true, lockedAt: Date.now() }),
      })

      const wrappedFn = withLock({ lockName: "testLock" })(mockFn)
      await wrappedFn(mockReq, mockRes)

      expect(mockFn).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(409)
      expect(mockRes.json).toHaveBeenCalledWith(
         expect.objectContaining({
            error: expect.stringContaining(
               "Process 'testLock' already running"
            ),
         })
      )
   })

   it("should override stale lock", async () => {
      const staleTime = Date.now() - 3700000 // More than 1 hour ago
      mockTransaction.get.mockResolvedValue({
         exists: true,
         data: () => ({ locked: true, lockedAt: staleTime }),
      })

      const wrappedFn = withLock({ lockName: "testLock" })(mockFn)
      await wrappedFn(mockReq, mockRes)

      expect(mockTransaction.get).toHaveBeenCalled()
      expect(mockFn).toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith(
         expect.stringContaining("Lock 'testLock' exceeded maxLockDuration")
      )
      expect(mockLockRef.set).toHaveBeenCalledWith(
         {
            locked: false,
            lockedAt: null,
         },
         { merge: true }
      )
   })

   it("should use getLockName function when provided", async () => {
      mockTransaction.get.mockResolvedValue({ exists: false })
      const getLockName = jest.fn().mockReturnValue("dynamicLock")

      const wrappedFn = withLock({ getLockName })(mockFn)
      await wrappedFn(mockReq, mockRes)

      expect(getLockName).toHaveBeenCalledWith(mockReq)
      expect(firestore.collection).toHaveBeenCalledWith("locks")
      expect(firestore.collection("locks").doc).toHaveBeenCalledWith(
         "dynamicLock"
      )
   })

   it("should handle errors and release lock", async () => {
      mockTransaction.get.mockResolvedValue({ exists: false }) // Lock is available
      const testError = new Error("Test error")
      mockFn.mockRejectedValue(testError)

      const wrappedFn = withLock({ lockName: "testLock" })(mockFn)

      await expect(wrappedFn(mockReq, mockRes)).rejects.toThrow("Test error")

      expect(logger.error).toHaveBeenCalledWith(
         expect.stringContaining("Error in withLock for 'testLock'"),
         testError
      )
      expect(mockLockRef.set).toHaveBeenCalledWith(
         {
            locked: false,
            lockedAt: null,
         },
         { merge: true }
      )
   })
})

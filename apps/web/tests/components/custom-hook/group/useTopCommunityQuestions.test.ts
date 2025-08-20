import { renderHook, waitFor } from "@testing-library/react"
import { useTopCommunityQuestions } from "components/custom-hook/group/useTopCommunityQuestions"

// Mock Firebase and dependencies
jest.mock("data/firebase/FirebaseInstance", () => ({
   FirestoreInstance: {},
}))

jest.mock("firebase/firestore", () => ({
   collection: jest.fn(),
   query: jest.fn(),
   where: jest.fn(),
   orderBy: jest.fn(),
   limit: jest.fn(),
   getDocs: jest.fn(),
}))

jest.mock("@careerfairy/shared-lib/BaseFirebaseRepository", () => ({
   createGenericConverter: jest.fn(),
}))

jest.mock("util/CommonUtil", () => ({
   errorLogAndNotify: jest.fn(),
}))

// Mock SWR
jest.mock("swr", () => ({
   __esModule: true,
   default: jest.fn(),
}))

describe("useTopCommunityQuestions", () => {
   const mockSWR = require("swr").default

   beforeEach(() => {
      jest.clearAllMocks()
   })

   it("should return empty array when groupId is null", () => {
      mockSWR.mockReturnValue({
         data: [],
         isLoading: false,
         error: null,
      })

      const { result } = renderHook(() => useTopCommunityQuestions(null))

      expect(result.current.data).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
   })

   it("should call SWR with correct key when groupId is provided", () => {
      const groupId = "test-group-id"
      mockSWR.mockReturnValue({
         data: [],
         isLoading: true,
         error: null,
      })

      renderHook(() => useTopCommunityQuestions(groupId))

      expect(mockSWR).toHaveBeenCalledWith(
         ["topCommunityQuestions", groupId],
         expect.any(Function),
         expect.objectContaining({
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            dedupingInterval: 300000,
         })
      )
   })

   it("should handle loading state", () => {
      mockSWR.mockReturnValue({
         data: undefined,
         isLoading: true,
         error: null,
      })

      const { result } = renderHook(() => useTopCommunityQuestions("test-group-id"))

      expect(result.current.isLoading).toBe(true)
   })

   it("should handle error state", () => {
      const error = new Error("Test error")
      mockSWR.mockReturnValue({
         data: undefined,
         isLoading: false,
         error,
      })

      const { result } = renderHook(() => useTopCommunityQuestions("test-group-id"))

      expect(result.current.error).toBe(error)
   })
})
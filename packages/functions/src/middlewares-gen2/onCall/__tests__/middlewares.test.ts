import { Group } from "@careerfairy/shared-lib/groups"
import { UserData } from "@careerfairy/shared-lib/users"
import { CallableRequest, HttpsError } from "firebase-functions/v2/https"
import * as validationLib from "../../../lib/validations"
import { Middleware, withMiddlewares } from "../middleware"
import { userIsGroupAdminMiddleware } from "../validations"

// Mock the validateUserIsGroupAdminFn function
jest.mock("../../../lib/validations", () => ({
   validateUserIsGroupAdmin: jest.fn(),
}))

describe("Gen2 Middleware Tests", () => {
   test("First middleware should return result instance", async () => {
      // arrange
      const expected = {}
      const handler = async () => expected
      const chain = withMiddlewares([], handler)

      // act
      const result = await chain({} as CallableRequest<unknown>)

      // assert
      expect(result).toBe(expected)
   })

   test("Middleware chain executes in correct order", async () => {
      // arrange
      const expected = {}
      const middleware: Middleware = async (request, next) => {
         return next(request)
      }
      const chain = withMiddlewares([middleware], async () => expected)

      // act
      const result = await chain({} as CallableRequest<unknown>)

      // assert
      expect(result).toBe(expected)
   })

   test("Middleware throws and circuits the chain", async () => {
      // arrange
      const expected = {}
      const validateDataExists: Middleware = async (request, next) => {
         if (!request.data) {
            throw new HttpsError(
               "invalid-argument",
               "data field must be present"
            )
         }
         return next(request)
      }

      const chain = withMiddlewares([validateDataExists], async () => expected)

      // confirm it works with valid data {}
      const result = await chain({ data: {} } as CallableRequest<unknown>)
      expect(result).toBe(expected)

      // should throw with null data
      await expect(async () => {
         await chain({ data: null } as unknown as CallableRequest<unknown>)
      }).rejects.toThrow("data field must be present")
   })

   test("Multiple middlewares compose correctly", async () => {
      type WithA = { middlewareData: { a: string } }
      type WithB = { middlewareData: { b: number } }

      const addA = <T>(): Middleware<T, T & WithA> => {
         return async (request, next) => {
            const nextRequest = {
               ...request,
               data: {
                  ...request.data,
                  middlewareData: {
                     ...((request.data as any)?.middlewareData || {}),
                     a: "value-a",
                  },
               },
            } as CallableRequest<T & WithA>

            return next(nextRequest)
         }
      }

      const addB = <T>(): Middleware<T, T & WithB> => {
         return async (request, next) => {
            const nextRequest = {
               ...request,
               data: {
                  ...request.data,
                  middlewareData: {
                     ...((request.data as any)?.middlewareData || {}),
                     b: 42,
                  },
               },
            } as CallableRequest<T & WithB>

            return next(nextRequest)
         }
      }

      // Properly type the handler to accept both a and b
      type CombinedMiddleware = {
         middlewareData: {
            a: string
            b: number
         }
      }

      // Act
      const chain = withMiddlewares(
         [addA(), addB()],
         async (request: CallableRequest<CombinedMiddleware>) => {
            return {
               a: request.data.middlewareData.a,
               b: request.data.middlewareData.b,
            }
         }
      )

      const result = await chain({ data: {} } as CallableRequest<unknown>)

      // Assert
      expect(result).toEqual({ a: "value-a", b: 42 })
   })

   test("userIsGroupAdminMiddleware with mock implementation", async () => {
      const mockGroup: Partial<Group> = {
         id: "group-123",
         universityName: "Test Group",
         logoUrl: "logo-url",
         groupId: "group-123",
         description: "Test group description",
      }

      const mockUserData: Partial<UserData> = {
         id: "user-123",
         authId: "auth-123",
         firstName: "Test",
         lastName: "User",
         avatar: "photo-url",
         isAdmin: false,
         userEmail: "test@test.com",
         university: {
            code: "test-uni",
            name: "Test University",
         },
         linkedinUrl: "",
         userResume: "",
         universityCountryCode: "US",
      }

      // Mock the validation function to return success
      const mockValidateUserIsGroupAdmin =
         validationLib.validateUserIsGroupAdmin as jest.Mock
      mockValidateUserIsGroupAdmin.mockResolvedValue({
         group: mockGroup,
         userData: mockUserData,
      })

      // Act - Use the actual middleware with our test handler
      const chain = withMiddlewares(
         [userIsGroupAdminMiddleware<{ groupId: string }>()],
         async (request) => {
            // Return data from the middleware
            return {
               group: request.data.middlewareData.groupAdmin.group,
               userData: request.data.middlewareData.groupAdmin.userData,
            }
         }
      )

      const result = await chain({
         data: { groupId: "group-123" },
         auth: { token: { email: "test@test.com" } },
      } as unknown as CallableRequest<{ groupId: string }>)

      // Assert
      expect(result).toEqual({
         group: mockGroup,
         userData: mockUserData,
      })
      expect(mockValidateUserIsGroupAdmin).toHaveBeenCalledWith(
         "group-123",
         "test@test.com"
      )
   })
})

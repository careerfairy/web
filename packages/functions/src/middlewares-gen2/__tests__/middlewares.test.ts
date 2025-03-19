import express from "express"
import { Request } from "firebase-functions/v2/https"
import { withMiddlewares, type Middleware } from "../onRequest"
import { KEEP_WARM_HEADER, warmingMiddleware } from "../validations-onRequest"

type Response = express.Response

// Mock response helper
const createMockResponse = () => {
   const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headersSent: false,
      locals: {},
   } as unknown as Response
   return res
}

test("First middleware should execute handler", async () => {
   // arrange
   const mockRequest = {} as unknown as Request
   const mockResponse = createMockResponse()
   const handlerSpy = jest.fn()

   const chain = withMiddlewares([passthrough], handlerSpy)

   // act
   await chain(mockRequest, mockResponse)

   // assert
   expect(handlerSpy).toHaveBeenCalledWith(mockRequest, mockResponse)
})

test("Second middleware should be executed", async () => {
   // arrange
   const mockRequest = {} as unknown as Request
   const mockResponse = createMockResponse()
   const firstMiddlewareSpy = jest
      .fn()
      .mockImplementation((req, res, next) => next(req, res))
   const secondMiddlewareSpy = jest
      .fn()
      .mockImplementation((req, res, next) => next(req, res))
   const handlerSpy = jest.fn()

   const chain = withMiddlewares(
      [firstMiddlewareSpy, secondMiddlewareSpy],
      handlerSpy
   )

   // act
   await chain(mockRequest, mockResponse)

   // assert
   expect(firstMiddlewareSpy).toHaveBeenCalled()
   expect(secondMiddlewareSpy).toHaveBeenCalled()
   expect(handlerSpy).toHaveBeenCalled()
})

test("First middleware throws and circuits the chain", async () => {
   // arrange
   const mockRequest = { body: { data: {} } } as unknown as Request
   const mockResponse = createMockResponse()
   const handlerSpy = jest.fn()

   const chain = withMiddlewares([validateDataExists, passthrough], handlerSpy)

   // confirm it works with valid data
   await chain(mockRequest, mockResponse)
   expect(handlerSpy).toHaveBeenCalled()

   // reset
   handlerSpy.mockReset()

   // expect it to throw with invalid data
   await expect(async () => {
      await chain({ body: { data: null } } as unknown as Request, mockResponse)
   }).rejects.toThrow("data field must be preset")
   expect(handlerSpy).not.toHaveBeenCalled()
})

test("Response middleware shortcircuits the chain", async () => {
   // arrange
   const mockRequest = {} as unknown as Request
   const mockResponse = createMockResponse()
   const handlerSpy = jest.fn()

   const chain = withMiddlewares([earlyResponse], handlerSpy)

   // act
   await chain(mockRequest, mockResponse)

   // assert
   expect(mockResponse.status).toHaveBeenCalledWith(200)
   expect(mockResponse.json).toHaveBeenCalledWith({ message: "Early response" })
   expect(handlerSpy).not.toHaveBeenCalled()
})

test("Warming middleware handles warming requests", async () => {
   // arrange
   const mockRequest = {
      headers: {
         [KEEP_WARM_HEADER]: "true",
      },
   } as unknown as Request
   const mockResponse = createMockResponse()
   const handlerSpy = jest.fn()

   const chain = withMiddlewares([warmingMiddleware], handlerSpy)

   // act
   await chain(mockRequest, mockResponse)

   // assert
   expect(mockResponse.status).toHaveBeenCalledWith(200)
   expect(mockResponse.send).toHaveBeenCalledWith("Function is warm")
   expect(handlerSpy).not.toHaveBeenCalled()
})

test("Warming middleware passes through normal requests", async () => {
   // arrange
   const mockRequest = {
      headers: {},
   } as unknown as Request
   const mockResponse = createMockResponse()
   const handlerSpy = jest.fn()

   const chain = withMiddlewares([warmingMiddleware], handlerSpy)

   // act
   await chain(mockRequest, mockResponse)

   // assert
   expect(handlerSpy).toHaveBeenCalled()
})

test("Middleware can modify request data for next middleware", async () => {
   // arrange
   const mockRequest = {} as unknown as Request
   const mockResponse = createMockResponse()
   let modifiedRequestData: any = null

   const chain = withMiddlewares(
      [
         addRequestData("testKey", "testValue"),
         // Capture the modified request data
         (req, res, next) => {
            modifiedRequestData = (req as any).testData
            return next(req, res)
         },
      ],
      jest.fn()
   )

   // act
   await chain(mockRequest, mockResponse)

   // assert
   expect(modifiedRequestData).toEqual({ testKey: "testValue" })
})

/*
|--------------------------------------------------------------------------
| Utility Middlewares
|--------------------------------------------------------------------------
*/
const validateDataExists: Middleware = (request, response, next) => {
   if (!request.body?.data) {
      throw new Error("data field must be preset")
   }

   return next(request, response)
}

const earlyResponse: Middleware = (request, response) => {
   response.status(200).json({ message: "Early response" })
   // Don't call next, which stops the middleware chain
   return
}

const passthrough: Middleware = (request, response, next) => {
   return next(request, response)
}

const addRequestData =
   (key: string, value: any): Middleware =>
   (request, response, next) => {
      const modifiedRequest = {
         ...request,
         testData: {
            ...(request as any).testData,
            [key]: value,
         },
      } as unknown as Request

      return next(modifiedRequest, response)
   }

import { CallableRequest } from "firebase-functions/https"
import { middlewares, OnCallMiddleware } from "../middlewares"

test("First middleware should return result instance", async () => {
   // arrange
   const expected = {}
   const chain = middlewares(handler(expected))

   // act
   const result = await chain({ data: {} } as CallableRequest)

   // assert
   expect(result).toBe(expected)
})

test("Second middleware should return result", async () => {
   // arrange
   const expected = {}
   const chain = middlewares(noop, handler(expected))

   // act
   const result = await chain({ data: {} } as CallableRequest)

   // assert
   expect(result).toBe(expected)
})

test("First middleware throws and circuits the chain", async () => {
   const expected = {}
   const chain = middlewares(validateDataExists, handler(expected))

   // confirm it works with valid data {}
   const result = await chain({ data: {} } as CallableRequest)
   expect(result).toBe(expected)

   await expect(async () => {
      await chain({ data: null } as CallableRequest)
   }).rejects.toThrow("data field must be preset")
})

test("Dummy cache middleware works", async () => {
   const database = {}

   const chain = middlewares(cache(database, "key1"), handler("1"))

   // reach the final middleware & populate cache
   expect(await chain({ data: {} } as CallableRequest)).toBe("1")
   // should have the value cached
   expect(await chain({ data: {} } as CallableRequest)).toBe("cached:1")
})

test("Last middleware throws when calling next", async () => {
   const chain = middlewares(noop, (context, next) => {
      return next()
   })

   await expect(async () => {
      await chain({ data: {} } as CallableRequest)
   }).rejects.toThrow("No next middleware to call, you're the last one")
})

test("Use context value from previous middleware", async () => {
   const chain = middlewares(addContext(), (context) => {
      return Promise.resolve(context.middlewares?.flag)
   })

   expect(await chain({ data: {} } as CallableRequest)).toBe(true)
})

/*
|--------------------------------------------------------------------------
| Utility Middlewares
|--------------------------------------------------------------------------
*/
const validateDataExists: OnCallMiddleware = (context, next) => {
   if (!context.data) {
      throw new Error("data field must be preset")
   }
   return next()
}

const cache =
   (database: object, key: string): OnCallMiddleware =>
   async (context, next) => {
      if (database[key]) {
         return database[key]
      }

      const result = await next()

      database[key] = `cached:${result}`

      return result
   }

const noop: OnCallMiddleware = (request, next) => {
   return next()
}

const handler =
   (result: any): OnCallMiddleware =>
   () => {
      return result
   }

const addContext =
   (): OnCallMiddleware<{ flag: boolean }> => (context, next) => {
      context.middlewares = {
         ...context.middlewares,
         flag: true,
      }

      return next()
   }

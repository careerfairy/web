import { Middleware, middlewares } from "../middlewares"

test("First middleware should return result instance", async () => {
   // arrange
   const expected = {}
   const chain = middlewares(handler(expected))

   // act
   const result = await chain({}, {})

   // assert
   expect(result).toBe(expected)
})

test("Second middleware should return result", async () => {
   // arrange
   const expected = {}
   const chain = middlewares(noop, handler(expected))

   // act
   const result = await chain({}, {})

   // assert
   expect(result).toBe(expected)
})

test("First middleware throws and circuits the chain", async () => {
   const expected = {}
   const chain = middlewares(validateDataExists, handler(expected))

   // confirm it works with valid data {}
   const result = await chain({}, {})
   expect(result).toBe(expected)

   await expect(async () => {
      await chain(null, {})
   }).rejects.toThrow("data field must be preset")
})

test("Dummy cacheOnCallValues middleware works", async () => {
   const database = {}

   const chain = middlewares(cache(database, "key1"), handler("1"))

   // reach the final middleware & populate cacheOnCallValues
   expect(await chain({}, {})).toBe("1")
   // should have the value cached
   expect(await chain({}, {})).toBe("cached:1")
})

test("Last middleware throws when calling next", async () => {
   const chain = middlewares(noop, (data, context, next) => {
      return next()
   })

   await expect(async () => {
      await chain({}, {})
   }).rejects.toThrow("No next middleware to call, you're the last one")
})

/*
|--------------------------------------------------------------------------
| Utility Middlewares
|--------------------------------------------------------------------------
*/
const validateDataExists: Middleware = (data, context, next) => {
   if (!data) {
      throw new Error("data field must be preset")
   }

   return next()
}

const cache =
   (database: object, key: string): Middleware =>
   async (data, context, next) => {
      if (database[key]) {
         return database[key]
      }

      const result = await next()

      database[key] = `cached:${result}`

      return result
   }

const noop: Middleware = (data, context, next) => {
   return next()
}

const handler =
   (result: any): Middleware =>
   () => {
      return result
   }

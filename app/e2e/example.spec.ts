import { test, expect, Page } from "@playwright/test"

test.beforeEach(async ({ page }) => {
   await page.goto("https://demo.playwright.dev/todomvc")
})

const TODO_ITEMS = [
   "buy some cheese",
   "feed the cat",
   "book a doctors appointment",
]

test.describe("Item", () => {
   test("should allow me to mark items as complete", async ({ page }) => {
      // Create two items.
      for (const item of TODO_ITEMS.slice(0, 2)) {
         await page.locator(".new-todo").fill(item)
         await page.locator(".new-todo").press("Enter")
      }

      // Check first item.
      const firstTodo = page.locator(".todo-list li").nth(0)
      await firstTodo.locator(".toggle").check()
      await expect(firstTodo).toHaveClass("completed")

      // Check second item.
      const secondTodo = page.locator(".todo-list li").nth(1)
      await expect(secondTodo).not.toHaveClass("completed")
      await secondTodo.locator(".toggle").check()

      // Assert completed class.
      await expect(firstTodo).toHaveClass("completed")
      await expect(secondTodo).toHaveClass("completed")
   })

   test("should allow me to un-mark items as complete", async ({ page }) => {
      // Create two items.
      for (const item of TODO_ITEMS.slice(0, 2)) {
         await page.locator(".new-todo").fill(item)
         await page.locator(".new-todo").press("Enter")
      }

      const firstTodo = page.locator(".todo-list li").nth(0)
      const secondTodo = page.locator(".todo-list li").nth(1)
      await firstTodo.locator(".toggle").check()
      await expect(firstTodo).toHaveClass("completed")
      await expect(secondTodo).not.toHaveClass("completed")
      await checkNumberOfCompletedTodosInLocalStorage(page, 1)

      await firstTodo.locator(".toggle").uncheck()
      await expect(firstTodo).not.toHaveClass("completed")
      await expect(secondTodo).not.toHaveClass("completed")
      await checkNumberOfCompletedTodosInLocalStorage(page, 0)
   })

   test("should allow me to edit an item", async ({ page }) => {
      await createDefaultTodos(page)

      const todoItems = page.locator(".todo-list li")
      const secondTodo = todoItems.nth(1)
      await secondTodo.dblclick()
      await expect(secondTodo.locator(".edit")).toHaveValue(TODO_ITEMS[1])
      await secondTodo.locator(".edit").fill("buy some sausages")
      await secondTodo.locator(".edit").press("Enter")

      // Explicitly assert the new text value.
      await expect(todoItems).toHaveText([
         TODO_ITEMS[0],
         "buy some sausages",
         TODO_ITEMS[2],
      ])
      await checkTodosInLocalStorage(page, "buy some sausages")
   })
})

async function createDefaultTodos(page: Page) {
   for (const item of TODO_ITEMS) {
      await page.locator(".new-todo").fill(item)
      await page.locator(".new-todo").press("Enter")
   }
}

async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
   return await page.waitForFunction((e) => {
      return JSON.parse(localStorage["react-todos"]).length === e
   }, expected)
}

async function checkNumberOfCompletedTodosInLocalStorage(
   page: Page,
   expected: number
) {
   return await page.waitForFunction((e) => {
      return (
         JSON.parse(localStorage["react-todos"]).filter((i) => i.completed)
            .length === e
      )
   }, expected)
}

async function checkTodosInLocalStorage(page: Page, title: string) {
   return await page.waitForFunction((t) => {
      return JSON.parse(localStorage["react-todos"])
         .map((i) => i.title)
         .includes(t)
   }, title)
}

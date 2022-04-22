import { Page, expect } from "@playwright/test"

export const expectExactText = async (page: Page, text: string) => {
   return expect(await page.locator(`text="${text}"`)).toBeVisible()
}

export const expectText = async (page: Page, text: string) => {
   return expect(await page.locator(`text=${text}`)).toBeVisible()
}

export const expectSelector = async (page: Page, selector: string) => {
   return expect(await page.locator(selector)).toBeVisible()
}

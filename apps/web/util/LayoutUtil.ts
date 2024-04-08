// Check if content overflows its container
export const isHeightOverflowing = (element: HTMLElement) => {
    return element?.scrollHeight > element?.clientHeight
 }
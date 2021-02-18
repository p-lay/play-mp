export const debounce = <T extends (...params: any[]) => void>(func: T, delay: number) => {
  let timer: number
  return function (this: any, ...args: any[]) {
    clearTimeout(timer)
    timer = window.setTimeout(() => func.apply(this, args), delay)
  } as T
}
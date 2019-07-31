export const Catch = <T>(action: T): T => {
  for (const key in action) {
    if (action.hasOwnProperty(key)) {
      const func = action[key]
      action[key] = addCatchError(func)
    }
  }
  return action
}

const addCatchError = (func: any) => {
  if (func instanceof Function) {
    return function() {
      try {
        func()
      } catch (err) {
        console.error('catch action error', err)
      }
    }
  } else {
    return func
  }
}

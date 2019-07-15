type CommonRes<T = any> = Promise<{
  // default 0
  code?: Code
  message?: string
  data: T
}>

type Code = 1000 | 2000 | 500

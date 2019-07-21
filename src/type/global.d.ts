type CommonRes<T = any> = Promise<{
  // default 0
  code?: Code
  message?: string
  data: T
}>

/**
 * 500: server error;
 * 1000: empty value not exception;
 * 2000: no data in table exception;
 */
type Code = 1000 | 2000 | 500

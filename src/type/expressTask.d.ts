interface ExpressTask {
  id: number
  category: string
  serialNumber: string
  status: number
  note: string
  updateTime: string
}

interface AddExpressTaskReq {
  category: string
  serialNumber: string
  note: string
}

interface RemoveExpressTaskReq {
  id: number
}

interface UpdateExpressTaskReq {
  id: number
  status: number
}

interface GetExpressTaskRes {
  taskByCategory: { [key: string]: ExpressTask[] }
  unpickCount: number
}

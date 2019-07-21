
interface BaseMemoria {
  title: string
  feeling?: string
  resources: BaseResource[]
  tags: Tag[]
  music?: string
}

// user info should be set in request
interface AddMemoriaReq extends BaseMemoria {
  user_id: number
}

interface GetMemoriaReq {
  id: number
}

interface GetMemoriaListRes {
  memorias: {
    title: string
    id: number
  }[]
}

interface MemoriaAppendInfo {
  id: number
  comments: string[]
  // TODO: should be type User not number
  create_by: number
  create_time: number
  update_time: number
}

interface GetMemoriaRes extends BaseMemoria, MemoriaAppendInfo {}

interface UpdateMemoriaReq extends BaseMemoria {
  id: number
}

interface DeleteMemoriaReq {
  id: number
}

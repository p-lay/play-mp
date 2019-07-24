
interface BaseMemoria {
  title: string
  feeling?: string
  resources: BaseResource[]
  thumb?: string
  tags: Tag[]
  music?: string
  create_time?: number
}

// user info should be set in request
interface AddMemoriaReq extends BaseMemoria {
  user_id: number
}

interface GetMemoriaReq {
  id: number
}

interface GetMemoriaListReq {
  tag_ids?: number[]
  create_by?: number
}
interface GetMemoriaListRes {
  memorias: {
    title: string
    id: number
    thumb: string
    feeling: string
    creator: string
    createTime: number
  }[]
}

interface MemoriaAppendInfo {
  id: number
  comments: string[]
  // TODO: should be type User not number
  create_by: number
  update_time: number
}

interface GetMemoriaRes extends BaseMemoria, MemoriaAppendInfo {}

interface UpdateMemoriaReq extends BaseMemoria {
  id: number
  existResourceIds?: number[]
}

interface DeleteMemoriaReq {
  id: number
}

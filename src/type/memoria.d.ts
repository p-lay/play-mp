
interface BaseVue {
  title: string
  feeling?: string
  resources: BaseResource[]
  tags: Tag[]
  music?: string
}

// user info should be set in request
interface AddVueReq extends BaseVue {
  user_id: number
}

interface GetVueReq {
  vue_id: number
}

interface GetMemoriaListRes {
  memorias: {
    title: string
    id: number
  }[]
}

interface VueAppendInfo {
  vue_id: number
  comments: string[]
  // TODO: should be type User not number
  create_by: number
  create_time: number
  update_time: number
}

interface GetVueRes extends BaseVue, VueAppendInfo {}

interface UpdateVueReq extends BaseVue {
  vue_id: number
}

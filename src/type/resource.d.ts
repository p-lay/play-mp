interface BaseResource {
  url: string
  type?: 'image' | 'video'
  description?: string
}

interface AddResourceReq {
  resources: BaseResource[]
}

interface GetResourceReq {
  resource_ids: number[]
}

interface GetResourceRes {
  resources: ({ id: number } & BaseResource)[]
}

interface DeleteResourceReq {
  ids: number[]
}

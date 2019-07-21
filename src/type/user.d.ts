interface UserInfo {
  nickName: string
  avatarUrl: string
  gender: number
  province: string
  city: string
  country: string
  language: string
}

interface GetUserInfoReq {
  code: string
}

interface GetUserInfoRes extends UserInfo {
  userId: number
  roleId: number
  isNew?: boolean
}

interface UpdateUserInfoReq extends UserInfo {
  userId?: number
}

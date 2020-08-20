interface CouponUser {
  nickName: string
  avatarUrl: string
}

interface EncryptCouponReq {
  message: string
  user_id: number
}

interface EncryptCouponRes {
  md5: string
}

interface DecryptCouponReq {
  md5: string
}

interface DecryptCouponRes {
  message?: string
  decryptFailed?: boolean
  createdBy?: CouponUser
  usedBy?: CouponUser
}

interface UseCouponReq extends DecryptCouponReq {
  user_id: number
}

interface UseCouponRes {
  useFailed?: boolean
}

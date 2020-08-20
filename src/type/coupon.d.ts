interface EncryptCouponReq {
  message: string
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
}

import jwt, {
  GetPublicKeyOrSecret,
  JwtHeader,
  SigningKeyCallback,
  type Algorithm,
} from 'jsonwebtoken'
import { z, ZodSchema } from 'zod'
import { TRSAType } from '@/types/rsa.types'
import { RSA } from '@/models/rsa.model'
import { ApiError } from '@/utils/error.utils'
import { TUser } from '@/types/user.types'
import { getActiveKeyPairWithType } from './rsa.service'
import { userJWTPayloadSchema } from '@/schemas/user.schemas'

const expiresInOptions: Record<TRSAType, string> = {
  userAccessToken: '1d',
  userRefreshToken: '365d',
} as const

const getKeyWithType: (keyType: TRSAType) => GetPublicKeyOrSecret =
  (keyType) => async (header: JwtHeader, callback: SigningKeyCallback) => {
    try {
      const keyPar = await RSA.findOne({
        _id: header.kid,
        type: keyType,
      })
      if (!keyPar) {
        throw new ApiError('BAD_REQUEST', 'Invalid token')
      }
      callback(null, keyPar.publicKey)
    } catch (error) {
      callback(error as Error)
    }
  }

export const createToken = async <Payload extends object>(
  data: Payload,
  keyType: TRSAType,
  schema: ZodSchema<Payload>
) => {
  try {
    const keyPair = await getActiveKeyPairWithType(keyType)
    if (!keyPair) {
      throw new Error('No key pair found')
    }
    const expiresIn = expiresInOptions[keyType]
    if (!expiresIn) {
      throw new Error(`No expiration time defined for key type: ${keyType}`)
    }
    const payload = schema.parse(data)
    const token = jwt.sign(payload, keyPair.privateKey, {
      algorithm: 'RS256',
      expiresIn,
      keyid: `${keyPair._id}`,
    })
    return token
  } catch (error) {
    throw error
  }
}

export const createUserToken = async (
  user: TUser,
  keyType: Extract<TRSAType, 'userAccessToken' | 'userRefreshToken'>
) => {
  try {
    const token = await createToken(user, keyType, userJWTPayloadSchema)
    return token
  } catch (error) {
    throw error
  }
}

// export const createUserToken = async (
//   user: TUser,
//   keyType: Extract<TRSAType, 'userAccessToken' | 'userRefreshToken'>
// ) => {
//   try {
//     const keyPair = await getActiveKeyPairWithType(keyType)
//     if (!keyPair) {
//       throw new Error('No key pair found')
//     }
//     const expiresIn = expiresInOptions[keyType]
//     const payload = userJWTPayloadSchema.parse(user)
//     const token = jwt.sign(payload, keyPair.privateKey, {
//       algorithm: 'RS256',
//       expiresIn,
//       keyid: `${keyPair._id}`,
//     })
//     return token
//   } catch (error) {
//     throw error
//   }
// }

export const verifyToken = async <S extends z.AnyZodObject>(
  token: string,
  keyType: TRSAType,
  schema: S
): Promise<z.infer<S>> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKeyWithType(keyType),
      {
        algorithms: ['RS256'],
      },
      (err, payload) => {
        if (err) {
          return reject(new ApiError('BAD_REQUEST', 'Invalid token'))
        }
        const parsedPayload = schema.parse(payload)
        return resolve(parsedPayload)
      }
    )
  })
}

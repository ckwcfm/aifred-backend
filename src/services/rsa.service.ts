import * as crypto from 'crypto'
import { RSA } from '@/models/rsa.model'
import { TRSAType } from '@/types/rsa.types'
import { addDays } from 'date-fns'
import { createRSAKeyPair } from '@/utils/rsa.utils'

const createKeyPairForType = async ({
  type,
  deprecatedAt = addDays(new Date(), 30),
  expireAt = addDays(new Date(), 60),
}: {
  type: TRSAType
  deprecatedAt?: Date
  expireAt?: Date
}) => {
  // generate the keys
  // save the keys
  const { publicKey, privateKey } = createRSAKeyPair()
  await RSA.create({
    publicKey,
    privateKey,
    type,
    deprecatedAt,
    expireAt,
  })
}

export const createKeyPairForTypeIfNeeded = async (type: TRSAType) => {
  try {
    const params = getKeyPairGenerationParams(type)
    const keyPairs = await RSA.find({
      type,
      deprecatedAt: { $gt: new Date() },
    })
    if (keyPairs.length < params.minimumKeyCount) {
      await createKeyPairForType({
        type,
        deprecatedAt: params.deprecatedAt,
        expireAt: addDays(params.deprecatedAt, 7),
      })
    }
  } catch (error) {
    throw error
  }
}

const getKeyPairGenerationParams = (type: TRSAType) => {
  switch (type) {
    case 'userAccessToken':
      return {
        minimumKeyCount: 10,
        deprecatedAt: addDays(new Date(), crypto.randomInt(7, 30)),
      }
    case 'userRefreshToken':
      return {
        minimumKeyCount: 10,
        deprecatedAt: addDays(new Date(), 365),
      }
  }
  assertUnreachable(type)
}

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}

export const getActiveKeyPairWithType = async (type: TRSAType) => {
  try {
    await createKeyPairForTypeIfNeeded(type)
    const keyPairs = await RSA.find({
      type,
      deprecatedAt: { $gt: new Date() },
    })

    const keyPair = crypto.randomInt(0, keyPairs.length)
    return keyPairs[keyPair]
  } catch (error) {
    throw error
  }
}

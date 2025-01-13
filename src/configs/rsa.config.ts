import { createKeyPairForTypeIfNeeded } from '@/services/rsa.service'
import { RSAType } from '@/schemas/rsa.schemas'

export const createKeyPairIfNeed = async () => {
  for (const type of RSAType) {
    await createKeyPairForTypeIfNeeded(type)
  }
}

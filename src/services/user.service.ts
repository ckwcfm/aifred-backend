import { User } from '@/models/user.model'
import { TCreateUser, TUser } from '@/types/user.types'

export async function createUser({ email, password }: TCreateUser) {
  const user = new User({
    email,
    password,
  })
  await user.save()
  return user
}

export async function getUserById({ id }: Pick<TUser, 'id'>) {
  const user = await User.findById(id)
  return user
}

export async function getUserByEmail({ email }: Pick<TUser, 'email'>) {
  const user = await User.findOne({ email })
  return user
}

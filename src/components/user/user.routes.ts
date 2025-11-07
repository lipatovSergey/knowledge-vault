import express, { RequestHandler } from 'express'
import userController from './user.controller'
// middlewares
import requireAuth from '../../middleware/require-auth.middleware'
import validateBody from '../../middleware/validate-body.middleware'
// validate chemas
import userSchemas from './user.validator'

const router = express.Router()
// create new user
router.post(
    '/',
    validateBody(userSchemas.userCreate),
    userController.createUser as RequestHandler
)
// get user's info by himself (authenticated)
router.get('/me', requireAuth, userController.getUserInfo)
// delete user by himself(authenticated)
router.delete('/me', requireAuth, userController.deleteUser)
// update user info
router.patch(
    '/me',
    requireAuth,
    validateBody(userSchemas.userInfoPatch),
    userController.updateUserData as RequestHandler
)

export default router

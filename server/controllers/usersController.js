const { User } = require('../models')

class UserController {

    static async getProfilesById(req, res, next) {
        try {
            const id = req.user.id
            const profile = await User.findByPk(id)
            if (!profile) {
                throw ({ name: 'NotFound', message: 'Profile not found' })

            }

            const rawProfile = (profile && typeof profile.toJSON === 'function') ? profile.toJSON() : profile
            const { password, ...profileWithoutPassword } = rawProfile || {}
            res.status(201).json(profileWithoutPassword)
        } catch (err) {
            console.log("ERROR GET PROFILE", err);
            next(err)
        }
    }

    static async updateProfile(req, res, next) {
        try {
            const id = req.params.id

            const user = await User.findByPk(id)
            if (!user) {
                throw ({ name: 'NotFound', message: 'Data not found' })
            }

            await user.update(req.body)

            const rawUser = (user && typeof user.toJSON === 'function') ? user.toJSON() : user
            const { password, ...userWithoutPassword } = rawUser || {}

            res.status(200).json(userWithoutPassword)
        } catch (err) {
            console.log("ERROR UPDATE PROFILE", err);
            next(err)
        }
    }

}
module.exports = UserController
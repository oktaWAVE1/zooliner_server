require('dotenv').config()
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const {User, Basket, BonusPoint, BonusPointsLog} = require('../models/models')
const mailService = require('../service/mail-service')
const tokenService = require('../service/token-service')
const UserDto = require("../dtos/user-dto");
const axios = require("axios")




class UserController {


    async registration (req, res, next) {
        try {
            const {email, password, name, telephone} = req.body
            if (!email || !password || !name) {

                return next(ApiError.badRequest('Не заполнены необходимые данные'))
            }
            const candidateEmail = await User.findOne({where: {email}})
            const candidatePhone = await User.findOne({where: {telephone}})

            if (candidateEmail) {
                return next(ApiError.badRequest('Такой email уже зарегистрирован'))
            }
            if (candidatePhone) {
                return next(ApiError.badRequest('Такой телефон уже зарегистрирован'))
            }
            if (password.length<8) {
                return next(ApiError.badRequest('Пароль должен содержать как минимум 8 символов'))
            }

            const hashPassword = await bcrypt.hash(password, 5)
            const activationLink = uuid.v4()
            await User.create({email, password: hashPassword, name, telephone, activationLink, isActivated: false}).then(async(user) => {
                const userDto = new UserDto(user);
                const tokens = tokenService.generateJwt({...userDto});
                await tokenService.saveToken(user.id, tokens.refreshToken)
                res.cookie('refreshToken', tokens.refreshToken, {maxAge: 60*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true})
                await mailService.sendActivationMail(email, process.env.API_URL+`/api/user/activate/${activationLink}`)
                await Basket.create({userId: user.id})
                await BonusPoint.create({userId: user.id})
                return res.json(tokens)
            })

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async resendActivationLink (req, res, nex){
        try {
            const {email} = req.body
            const user = await User.findOne({where: {email}})
            if (!user){
                return next(ApiError.badRequest('Пользователь не найден'))
            }
            await mailService.sendActivationMail(email, process.env.API_URL+`/api/user/activate/${user.activationLink}`)
            return res.json("Ссылка для активации отправлена на Ваш email. Пожалуйста, перейдите по ссылке, для активации аккаунта.")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async login (req, res, next) {
        try {

            const {email, telephone, password} = req.body
            const user = await User.findOne({where: {email}}) || await User.findOne({where: {telephone}})

            if (!user) {
                return next(ApiError.badRequest("Такого пользователя не существует"))
            }
            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.badRequest("Введен неверный пароль"))
            }
            if(!user.isActivated){
                return next(ApiError.needEmailApproval("Подтвердите аккаунт по электронной почте"))
            }
            await user.update({lastVisitDate: Date.now()})
            const userDto = new UserDto(user);
            const tokens = tokenService.generateJwt({...userDto});
            await tokenService.saveToken(user.id, tokens.refreshToken)
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 60*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true})
            return res.json(tokens)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



    async VKID(req, res, next) {
        try {
            const {payload} = req.query
            const data = JSON.parse(payload)




            await axios.get("https://api.vk.com/method/auth.exchangeSilentAuthToken", {
                params:{
                    v: process.env.VK_API_VERSION,
                    token: data.token,
                    access_token: process.env.VK_SERVICE_TOKEN,
                    uuid: data.uuid
                }
            }).then(async (resp)=> {
                if(!resp?.data?.response?.user_id){
                    console.log(resp)
                    return res.redirect(`${process.env.CLIENT_URL}/failed_auth`)
                }
                const user = await User.findOne({where: {vkId: data.user.id}})

                if (user) {
                    const userDto = new UserDto(user);
                    const tokens = tokenService.generateJwt({...userDto});
                    await tokenService.saveToken(user.id, tokens.refreshToken)
                    res.cookie('refreshToken', tokens.refreshToken, {maxAge: 60*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true})
                    return res.redirect(`${process.env.CLIENT_URL}/check?accessToken=${tokens.accessToken}`)
                }

                await User.findOne({where: {email: resp.data.response.email}}).then(async (registeredEmailUser) => {

                if (registeredEmailUser) {
                    await User.update({vkId: data.user.id}, {where: {id: registeredEmailUser.id}})

                    const userDto = new UserDto(registeredEmailUser);
                    const tokens = tokenService.generateJwt({...userDto});
                    await tokenService.saveToken(registeredEmailUser.id, tokens.refreshToken)
                    res.cookie('refreshToken', tokens.refreshToken, {maxAge: 60*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true})
                    return res.redirect(`${process.env.CLIENT_URL}/check?accessToken=${tokens.accessToken}`)
                } else {
                    const randomPass = await bcrypt.hash(uuid.v4(), 5)
                    const activationLink = uuid.v4()
                    await User.create({
                        email: resp.data.response.email,
                        password: randomPass,
                        name: `${data?.user?.first_name} ${data?.user?.last_name}`,
                        telephone: '',
                        activationLink,
                        isActivated: true,
                        vkId: data.user.id

                    }).then(async (newUser) => {
                            const userDto = new UserDto(newUser);
                            await Basket.create({userId: newUser.id})
                            await BonusPoint.create({userId: newUser.id})
                            const tokens = tokenService.generateJwt({...userDto});
                            await tokenService.saveToken(newUser.id, tokens.refreshToken)
                            res.cookie('refreshToken', tokens.refreshToken, {
                                maxAge: 60 * 24 * 60 * 60 * 1000,
                                httpOnly: true,
                                sameSite: "none",
                                secure: true
                            })
                            return res.redirect(`${process.env.CLIENT_URL}/check?accessToken=${tokens.accessToken}`)


                    })
                }
            })
            })






        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async check (req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (!refreshToken) {
                return
            }

            const user = await tokenService.refresh(refreshToken, next)
            if (!user) {
                res.clearCookie('refreshToken')
                return next(ApiError.internal("Не авторизован"))
            } else {
                if (!user.isActivated){
                    return next(ApiError.needEmailApproval("Подтвердите аккаунт по электронной почте"))
                }
                await user.update({lastVisitDate: Date.now()})
                const userDto = new UserDto(user);
                const tokens = tokenService.generateJwt({...userDto});
                await tokenService.saveToken(user.id, tokens.refreshToken)
                res.cookie('refreshToken', tokens.refreshToken, {maxAge: 60*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true})
                return res.json(tokens)
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async getSelf (req, res, next) {
        try {
            const {id} = req.body
            const user = await User.findOne({
                where: {id}, attributes: ['name', 'email', 'telephone', 'id', 'address'],
                include: [{model: BonusPoint}]
            })
            return res.json(user)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async getAll (req, res, next) {
        try {
            const users = await User.findAll({
                include: [{model: BonusPoint, include: [
                        {model: BonusPointsLog}
                    ]}]
            })
            return res.json(users)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async modify (req, res, next) {
        try {
            const {email, password, name, telephone, id, newPassword, address} = req.body
            const user = await User.findOne({where: {id}})
            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.internal("Введен неверный пароль"))
            }
            if (newPassword?.length>=8){
                const hashPassword = await bcrypt.hash(newPassword, 5)
                User.update({email, name, telephone, address, password: hashPassword}, {where: {id}})
            } else if (newPassword?.length===0 || !newPassword){
                User.update({email, name, telephone, address}, {where: {id}})
            } else {
                return next(ApiError.internal("Указан слишком короткий пароль"))
            }
            return res.json("Данные пользователя обновлены.")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async setRole (req, res, next) {
        try {
            const {userId, role} = req.body
            await User.update({role}, {where: {id: userId}})
            return res.json("Роль успешно изменена")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async setEmailActivated (req, res, next) {
        try {
            const {userId, isActivated} = req.body
            await User.update({isActivated}, {where: {id: userId}})
            return res.json("Email активация изменена")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async activate (req, res, next) {
        try {
            const activationLink = req.params.link

            const user = User.findOne({where: {activationLink}})
            if(!user){
                return next(ApiError.badRequest("Неверная ссылка активации"))
            }
            const updatedLink = uuid.v4()
            await User.update({isActivated: true, activationLink: updatedLink}, {where: {activationLink}})
            return res.redirect(process.env.CLIENT_URL+'/login')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async sendResetPassMail (req, res, next) {
        try {

            const {email} = req.body
            const user = await User.findOne({where: {email}})

            if(!user){
                return next(ApiError.badRequest("Нет пользователя с таким email"))
            }
            await mailService.sendResetPassMail(email, process.env.CLIENT_URL+`/reset_pass/${user.activationLink}`)
            return res.json('Ссылка для восстановления пароля отправлена на ваш email')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async resetPass (req, res, next) {
        try {
            const {password, activationLink} = req.body
            const user = await User.findOne({where: {activationLink}})
            if(!user){
                return next(ApiError.internal("Неверная ссылка сброса пароля. Проверьте почту или заново запросите ссылку для восстановления."))
            }
            const hashPassword = await bcrypt.hash(password, 5)
            const updatedLink = uuid.v4()
            await User.update({password: hashPassword, activationLink: updatedLink}, {where: {activationLink}})
            return res.json(user)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async logout (req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await tokenService.removeToken({refreshToken})
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}

module.exports = new UserController()
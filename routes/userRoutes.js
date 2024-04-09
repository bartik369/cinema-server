import express from 'express';
import User from '../models/user/User.js';
import Token from '../models/user/Token.js';
import Password from '../models/user/Password.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as serverConst from '../utils/constants.js';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

router.post(`${process.env.API_AUTH}`,
    async(req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(400).json({ message: serverConst.checkAuthData })
            }
            const candidat = await Password.findOne({ userId: user._id });
            const comparePassword = await bcrypt.compare(password, candidat.password);

            if (!comparePassword) {
                return res.status(400).json({ message: serverConst.checkAuthData })
            }
            const accessToken = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    roles: user.roles,
                    member: user.member,
                },
                process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' }
            );
            const refreshToken = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    roles: user.roles,
                    member: user.member,
                },
                process.env.JWT_REFRESH_SECRET, { expiresIn: '18d' }
            );
            const token = await Token.findOne({ user: user._id });

            if (token) {
                token.refreshToken = refreshToken;
            }
            const tokenData = await Token.create({
                user: user._id,
                refreshToken: refreshToken,
            });
            await tokenData.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            });
            return res.json({ token: accessToken, user: user });
        } catch (error) { console.log(error) }
    });

router.post(`${process.env.API_CREATE_USER}`,
    async(req, res) => {
        try {
            const { email, password } = req.body;
            const dublicate = await User.findOne({ email: email });

            if (dublicate) {
                return res.status(400).json({ message: serverConst.checkAuthData });
            }
            const hashPassword = await bcrypt.hash(password, 7);
            const user = new User({
                email: email,
                roles: ['USER'],
                member: ['START'],
            })
            await user.save();

            if (user) {
                await Password.create({
                    userId: user._id,
                    password: hashPassword,
                });
                return res.status(201).json({ message: serverConst.userCreated });
            } else {
                return res.status(400).json({ message: serverConst.invalidUserData });
            }
        } catch (error) { console.log(error) }
    });

router.get(`${process.env.API_VERIFY_TOKEN}`,
    async(req, res, next) => {

        if (req.method === 'OPTIONS') {
            return next();
        }
        try {
            const accessToken = req.headers.authorization.split(' ')[1];
            if (!accessToken) {
                return res.status(401).json({ message: serverConst.notAuthorized })
            } else {
                jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, decoded) => {

                    if (err) {
                        return res.status(403).json({ message: serverConst.accessDenied });
                    } else {
                        return res.json({ token: accessToken, user: decoded });
                    }
                });
            }

        } catch (error) { console.log(error) }
    })

router.get(`${process.env.API_REFRESH_TOKEN}`,
    async(req, res) => {
        try {
            const token = req.cookies.refreshToken;
            const decocedInfo = {};

            if (!token) return res.status(401).json({ message: serverConst.notAuthorized });
            jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {

                if (err) {
                    return res.status(401).json({ message: serverConst.notAuthorized });
                } else {
                    Object.assign(decocedInfo, decoded)
                }
            });
            const user = await User.findById(decocedInfo['_id']);

            if (!user) return res.status(401).json({ message: serverConst.notAuthorized });
            const accessToken = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    roles: user.roles,
                    member: user.member,
                },
                process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' }
            );
            const refreshToken = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    roles: user.roles,
                    member: user.member,
                },
                process.env.JWT_REFRESH_SECRET, { expiresIn: '18d' }
            );
            const existToken = await Token.findOne({ user: user._id });

            if (existToken) {
                const updateTokenData = await Token.findOneAndUpdate({ _id: existToken._id }, {
                    refreshToken: refreshToken,
                })
                await updateTokenData.save()
            } else {
                const tokenData = await Token.create({
                    user: user._id,
                    refreshToken: refreshToken,
                });
                await tokenData.save()
            }
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            });
            return res.json({ token: accessToken, user: user })
        } catch (error) { console.log(error) }
    });

router.post(`${process.env.API_LOGOUT}`,
    async(req, res) => {
        try {
            const { cookie } = req.headers;
            const refreshToken = cookie.split("refreshToken=")[1].split(";")[0];
            await Token.deleteOne({ refreshToken: refreshToken });
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(200).json({ message: serverConst.logoutSuccess });
        } catch (error) { console.log(error) }
    })

export default router;
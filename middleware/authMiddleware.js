import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import * as serverConst from '../utils/constants.js'
// import User from '../models/user/User';

dotenv.config();

export const authMiddleWare = (req, res, next) => {
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
                    console.log(decoded)
                    next();
                }
            });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: serverConst.notAuthorized });
    }
};
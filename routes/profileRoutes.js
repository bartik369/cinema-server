import express from 'express';
import User from '../models/user/User.js';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

router.get(`${process.env.API_PROFILE}`, async(req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (user) {
            return res.json(user)
        }
    } catch (error) {}
});

export default router;
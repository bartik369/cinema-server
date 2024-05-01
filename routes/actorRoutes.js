import express from 'express';
import ActorModel from '../models/media/actor.js';
import MovieModel from '../models/media/movie.js'
import multer from 'multer';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

const actorPortrait = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `${process.env.UPLOADS_ACTORS_PICS}`);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});


router.get(`${process.env.API_ACTOR}`, async(req, res) => {
    try {
        const { id } = req.params;
        const actorData = await ActorModel.findOne({ _id: id });
        return res.json(actorData)

    } catch (error) {
        return error;
    }
});

router.get(`${process.env.API_MOVIE_BY_ACTOR}`, async(req, res) => {
    try {
        const { id } = req.params;

        const actorData = await ActorModel.findOne({ _id: id });
        const moviesData = await MovieModel.find({
            actors: { $all: actorData.nameRu },
        })
        return res.json(moviesData)

    } catch (error) {
        return error;
    }
});

router.get(`${process.env.API_ACTORS}`, async(req, res) => {
    try {
        const actorData = await ActorModel.find({});

        if (actorData) {
            return res.json(actorData);
        }
    } catch (error) {
        return error;
    }
});

router.post(`${process.env.API_MOVIE_ACTORS}`, async(req, res) => {
    try {
        const actorsData = await ActorModel.aggregate([
            { $match: { nameRu: { $in: req.body } }, },
        ]);
        return res.json(actorsData);
    } catch (error) {
        return error;
    }
});

router.post(`${process.env.API_ADD_ACTOR}`, multer({ storage: actorPortrait }).single('file'),
    async(req, res) => {
        try {
            const { nameEn, nameRu, link, birthday, country, city, height, gender, genre } = req.body;
            const actorData = new ActorModel({
                nameEn: nameEn,
                nameRu: nameRu,
                picture: req.file.originalname,
                extInfo: {
                    link: link,
                    birthday: birthday,
                    country: country,
                    city: city,
                    height: height,
                    gender: gender,
                    genre: genre.split(','),
                },
            });
            await actorData.save();
        } catch (error) {
            return error;
        }
    }
);

export default router;
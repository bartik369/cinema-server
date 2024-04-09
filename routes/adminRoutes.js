import express from 'express';
import multer from 'multer';
import User from '../models/user/User.js';
import Movie from '../models/media/movie.js';
import Slider from '../models/media/slider.js';
import fs from 'fs';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

const movieSlider = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `${process.env.UPLOADS_SLIDER_PICS}`);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

router.get(`${process.env.API_USERS}`, async(req, res) => {
    try {
        const usersData = await User.find({});
        if (usersData) {
            return res.json(usersData);
        }
    } catch (error) {}
});

router.get(`${process.env.API_MOVIES_COUNT}`, async(req, res) => {
    try {
        const moviesData = await Movie.find({});
        if (moviesData) {
            return res.json(moviesData.length);
        }
    } catch (error) {}
});

router.post(`${process.env.API_ADD_SLIDE}`, multer({ storage: movieSlider }).single('file'),
    async(req, res) => {
        try {
            const { movieTitle, description } = req.body;
            const movie = await Movie.findOne({ titleRu: movieTitle });
            const slideData = new Slider({
                movieId: movie.id,
                movieLink: movie.id,
                media: req.file.originalname,
                description: description,
                movieTitle: movieTitle,
            });
            await slideData.save();
            return res.json(slideData);
        } catch (error) {}
    }
);

router.get(`${process.env.API_GET_SLIDES}`, async(req, res) => {
    try {
        const dataSlides = await Slider.find({});
        if (dataSlides) {
            return res.json(dataSlides);
        }
    } catch (error) {}
});

router.post(`${process.env.API_GET_SLIDE}`, async(req, res) => {
    try {
        const { id } = req.body;
        const slideData = await Slider.findOne({ _id: id });
        fs.readFile(`${process.env.UPLOADS_SLIDER_PICS}${slideData.media}`, (err, data) => {
            let file64 = data.toString('base64');
            return res.json({ slideData, file64 });
        });
    } catch (error) {}
});

router.delete(`${process.env.API_DELETE_SLIDE}`, async(req, res) => {
    try {
        const { id } = req.body;
        const existSlide = await Slider.findById(id);
        fs.unlink(`${process.env.UPLOADS_SLIDER_PICS}${existSlide.media}`, (err) => {
            if (err) {
                throw err;
            }
        });
        const slideData = await Slider.findByIdAndDelete(id);
        return res.json(slideData);
    } catch (error) {}
});

router.put(`${process.env.API_UPDATE_SLIDE}`, multer({ storage: movieSlider }).single('file'),
    async(req, res) => {
        try {
            const { _id, movieTitle, media, description } = req.body;
            const movie = await Movie.findOne({ titleRu: movieTitle });

            if (movie) {
                const slide = await Slider.findById(_id);

                if (slide) {
                    if (req.file) {
                        fs.unlink(`${process.env.UPLOADS_SLIDER_PICS}${slide.media}`, (err) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                    const updatedSlide = await Slider.findByIdAndUpdate(_id, {
                        movieId: _id,
                        movieLink: movie._id,
                        media: req.file ? req.file.originalname : media,
                        description: description,
                        movieTitle: movieTitle,
                    });
                    await updatedSlide.save();
                    return res.json(updatedSlide);
                }
            }
        } catch (error) {}
    }
);

export default router;
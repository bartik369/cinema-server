import express from 'express';
import Movie from '../models/media/movie.js';
import Favorite from '../models/media/favotite.js';
import dotenv from 'dotenv';
import multer from 'multer';

const router = express.Router();
dotenv.config();

const moviePoster = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, `${process.env.UPLOADS_MOVIES_PICS}`);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

router.post(`${process.env.API_MOVIES}`, async(req, res) => {
    const { genre, country, year, rating } = req.body.filter;
    const { page } = req.body;
    const totalMovies = await Movie.find({})
    const per_page = 21
    const total = totalMovies.length;
    let total_pages;
    const filterObj = {};

    if (genre.length > 0) {
        filterObj.genre = { $in: genre };
    }

    if (country.length > 0) {
        filterObj.country = { $in: country };
    }

    if (year.length > 0) {
        filterObj.year = { $in: year };
    }

    if (rating.length > 0) {
        filterObj.rating = { $in: rating };
    }

    try {
        const data = await Movie.find(filterObj).limit(21).skip((page - 1) * 21);
        if (Object.keys(filterObj).length == 0) {
            total_pages = Math.ceil(total / per_page)
        } else {
            total_pages = Math.ceil(data.length / per_page)
        }
        return res.json({ page, per_page, total, total_pages, data });
    } catch (error) {
        console.log(error)
    }
});

router.get(`${process.env.API_LAST_MOVIES}`, async(req, res) => {
    try {
        const moviesData = await Movie.find().sort({ $natural: -1 }).limit(12);
        return res.json(moviesData);
    } catch (error) {
        return error;
    }
});

router.get(`${process.env.API_TOP_MOVIES}`, async(req, res) => {
    try {
        const moviesData = await Movie.find({
            rating: { $gt: 7 },
        });
        return res.json(moviesData);
    } catch (error) {
        return error;
    }
});


router.post(`${process.env.API_MOVIE}`, async(req, res) => {
    try {
        const { id } = req.body;
        const movieData = await Movie.findOne({ _id: id })

        if (movieData) {
            return res.json(movieData);
        }
    } catch (error) {
        return res.status(404).json({ message: 'movie not found' });
    }
});

router.post(`${process.env.API_SEARCH_MOVIE}`, async(req, res) => {
    try {
        const { search } = req.body;

        const movieData = await Movie.find({
            titleRu: { $options: 'i', $regex: search },
        });
        return res.json(movieData);

    } catch (error) {
        return error;
    }
});

router.post(`${process.env.API_ADD_MOVIE}`, multer({ storage: moviePoster }).any(),
    async(req, res) => {
        try {
            const {
                titleEn,
                titleRu,
                genre,
                year,
                country,
                description,
                director,
                ageCategory,
                time,
                actors,
            } = req.body;
            const movieData = new Movie({
                titleEn: titleEn,
                titleRu: titleRu,
                picture: req.files[0].originalname,
                trailer: req.files[1].originalname || '',
                genre: genre.split(','),
                year: year,
                country: country,
                description: description,
                director: director,
                ageCategory: ageCategory,
                time: time,
                rating: 0,
                actors: actors.split(','),
            });
            await movieData.save();
        } catch (error) {
            return error;
        }
    }
);
router.post(`${process.env.API_SET_RATING}`, async(req, res) => {
    try {
        const { value, id } = req.body;
        const movieData = await Movie.findById(id);

        if (movieData) {
            const ratingData = await Movie.findByIdAndUpdate(id, {
                rating: movieData.rating === 0 ?
                    value + movieData.rating :
                    (value + movieData.rating) / 2,
            });
            await ratingData.save();
            const newData = await Movie.findById(id);
            return res.json(newData);
        }
    } catch (error) {
        return error;
    }
});

router.get(`${process.env.API_GET_RATING}`, async(req, res) => {
    try {
        const { id } = req.params;
        const movieData = await Movie.findById(id);

        if (movieData) { return res.json(movieData.rating) };
    } catch (error) {
        return error;
    }
});

router.post(`${process.env.API_ADD_FAVORITE}`, async(req, res) => {
    try {
        const { userId, movieId } = req.body;
        const existRecord = await Favorite.findOne({ userId: userId });

        if (!existRecord) {
            const newRecord = new Favorite({
                userId: userId,
                movies: movieId,
            });
            await newRecord.save();
            return res.json(newRecord);
        } else {
            const existFavotite = await Favorite.findOne({
                movies: { $all: movieId },
            });

            if (existFavotite) {
                const removeFavorite = await Favorite.findByIdAndUpdate(
                    existRecord._id, {
                        $pull: { movies: movieId },
                    }
                );
                return res.json(removeFavorite);
            } else {
                const newData = await Favorite.findByIdAndUpdate(existRecord._id, {
                    $push: { movies: movieId },
                });
                await newData.save();
                return res.json(newData);
            }
        }
    } catch (error) {
        return error;
    }
});

router.get(`${process.env.API_MOVIE_PROPERTIES}`, async(req, res) => {
    try {
        const movieData = await Movie.find({});

        const genreArr = [...new Set(movieData.flatMap((item) => item.genre))];
        const countryArr = [...new Set(movieData.map((item) => item.country))];
        const yearArr = [...new Set(movieData.map((item) => item.year))];
        const ratingArr = [...new Set(movieData.map((item) => item.rating))];

        return res.json({ genreArr, countryArr, yearArr, ratingArr });
    } catch (error) {
        return error;
    }
});

router.post(`${process.env.API_MOVIE_FAVORITES}`, async(req, res) => {
    try {
        const { id } = req.body;
        const favoriteData = await Favorite.findOne({ userId: id });

        if (favoriteData) {
            return res.json(favoriteData);
        } else {
            return null;
        }
    } catch (error) {
        return error;
    }
});

export default router;
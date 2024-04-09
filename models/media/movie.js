import mongoose from 'mongoose';

const   MovieSchema = new mongoose.Schema({
    titleEn: {
        type: String,
    },
    titleRu: {
        type: String,
    },
    picture: {
        type: String,
    },
    trailer: {
        type: String,
    },
    genre: {
        type: [],
    },
    year: {
        type: String,
    },
    country: {
        type: String,
    },
    description: {
        type: String,
    },
    director: {
        type: String,
    },
    ageCategory: {
        type: String,
    },
    time: {
        type: String,
    },
    actors: {
        type: [],
    },
    rating: {
        type: Number,
    }
});

const Movie = mongoose.model('Movie', MovieSchema);

export default Movie;
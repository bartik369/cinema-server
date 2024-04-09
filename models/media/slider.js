import mongoose from 'mongoose';

const SliderSchema = new mongoose.Schema({
    movieId: {
        type: String,
    },
    movieLink: {
        type: String,
    },
    media: {
        type: String,
    },
    description: {
        type: String,
    },
    movieTitle: {
        type: String,
    }
});

const Slider = mongoose.model('Slider', SliderSchema);

export default Slider;
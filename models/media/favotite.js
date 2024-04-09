import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    movies: {
        type: []
    }
});

const Favorite = mongoose.model('Favorite', FavoriteSchema);
export default Favorite;
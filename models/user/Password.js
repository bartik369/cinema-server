import mongoose from 'mongoose';
const { Schema } = mongoose;

const PasswordShema = new Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },

});

const Password = mongoose.model('Password', PasswordShema);
export default Password;
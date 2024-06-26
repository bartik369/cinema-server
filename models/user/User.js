import mongoose from 'mongoose';

const UserScheme = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: true,
    },
    roles: [{
        type: String,
        ref: 'Roles',
    }],
    member: [{
        type: String,
        ref: 'Members',
    }],
    avatar: {
        type: String,
        default: '',
    },
});

const User = mongoose.model('User', UserScheme);
export default User;
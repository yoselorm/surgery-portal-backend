const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    specialty: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        index: true
    },
    city: {
        type: String,
        required: true
    },
    doctorId: {
        type: String,
        unique: true
    },
    phone: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    password: {
        type: String,
        required: true
    },
    updatePassword: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailReceived:Boolean,
    // refreshToken: {
    //     token: { type: String, default: null },
    //     createdAt: { type: Date, default: Date.now }
    // }
    refreshToken: {
        type: String,
        default: null
    }

}, { timestamps: true })


// PRE-SAVE HOOK (async → no next)
userSchema.pre('save', async function () {
    if (!this.isNew) return;

    if (!this.doctorId) {
        let isUnique = false;
        let newId;

        while (!isUnique) {
            const nameParts = this.fullname.trim().split(' ');
            const firstInitial = nameParts[0]?.[0] || '';
            const lastInitial = nameParts[nameParts.length - 1]?.[0] || '';
            const initials = `${firstInitial}${lastInitial}`.toUpperCase();

            const randomNum = Math.floor(1000 + Math.random() * 9000);
            newId = `DR-${initials}${randomNum}`;

            const existing = await mongoose.model('User').findOne({ doctorId: newId });
            if (!existing) isUnique = true;
        }

        this.doctorId = newId;
    }
});


// POST-SAVE CHECK
userSchema.post('save', function (doc) {
    if (!doc.doctorId) {
        throw new Error('Doctor ID generation failed');
    }
});


const User = mongoose.model('User', userSchema)
module.exports = User

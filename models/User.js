const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			min: 3,
			max: 20,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			max: 50,
		},
		password: {
			type: String,
			required: true,
			max: 30,
		},
		profilePicture: {
			type: String,
			default: '',
		},
		coverPicture: {
			type: String,
			default: '',
		},
		followers: [
			{
				type: String,
				ref: 'User',
			},
		],
		following: [
			{
				type: String,
				ref: 'User',
			},
		],
		isAdmin: {
			type: Boolean,
			default: false,
		},
		desc: {
			type: String,
			min: 8,
			max: 256,
		},
		city: {
			type: String,
			max: 50,
		},
		from: {
			type: String,
			max: 50,
		},
		relationship: {
			type: Number,
			enum: [1, 2, 3],
		},
	},
	{
		timestamps: true,
	}
)

UserSchema.set('toJSON', {
	transform: (object, returnedObject) => {
		returnedObject.id = object._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
		delete returnedObject.password
		delete returnedObject.createdAt
		delete returnedObject.updatedAt
	},
})

module.exports = mongoose.model('User', UserSchema)

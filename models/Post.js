const mongoose = require('mongoose')
const postSchema = new mongoose.Schema(
	{
		author: {
			type: String,
			ref: 'User',
			required: true,
		},
		description: {
			type: String,
			max: 256,
		},
		img: {
			type: String,
		},
		likes: {
			type: Array,
			default: [],
		},
	},
	{
		timestamps: true,
	}
)

postSchema.set('toJSON', {
	transform: (object, returnedObject) => {
		returnedObject.id = object._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
		// will be changed if you added the functionality of edit log or something
		// or for checking if the post has been updated or not on the client side for example
		delete returnedObject.updatedAt
	},
})

module.exports = mongoose.model('Post', postSchema)

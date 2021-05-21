const mongoose = require('mongoose')
const { cloudinary } = require('../cloudinary')
const Schema = mongoose.Schema
const Review = require('./review')
const User = require('./user')

const ImageSchema = new Schema ({
    filename : String,
    url : String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/image/upload', '/image/upload/w_200')
})

const opts = {toJSON : {virtuals : true}}

const CampgroundSchema = new Schema ({
    title : String,
    price : Number,
    images: [ ImageSchema ],
    geometry : {
        type : {
            type : String,
            enum : ['Point'],
            required : true
        },
        coordinates : {
            type : [Number],
            required : true
        }
    },
    description : String,
    location : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ],
    author :
        {
            type : Schema.Types.ObjectId,
            ref : 'User' 
        }
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `
    <strong><a href = "/campgrounds/${this.id}" target="_blank"> ${this.title} </a> </strong>`
})

CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id : {
                $in : doc.reviews
            }
        })
        // for (let img of doc.images) {
        //     await cloudinary.uploader.destroy(img.filename)
        // }
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)
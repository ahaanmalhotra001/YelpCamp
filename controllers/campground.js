const ExpressError = require('../utils/ExpressError')
const { campgroundSchema } = require('../joiSchemas')
const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')

const mapBoxToken = process.env.MAPBOX_TOKEN
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const geoCoder = mbxGeocoding({accessToken : mapBoxToken})

module.exports.index = async (req, res) => {
    const Campgrounds = await Campground.find({})
    res.render('campgrounds/index', { Campgrounds })
}

module.exports.newForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => {

    const geoData = await geoCoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send()

    const { title, location, price, description } = req.body.campground
    const userid = req.user._id

    newC = new Campground({ title, location, price, description, author: userid })
    newC.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newC.geometry = geoData.body.features[0].geometry
    await newC.save()
    //console.log(newC)
    req.flash('success', 'New campground created successfully!')
    res.redirect(`/campgrounds/${newC._id}`)
}

module.exports.showCampground = async (req, res,) => {
    //console.log( await Campground.findById(req.params.id).populate('reviews'));
    campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')

    //console.log(campground.geometry.coordinates)

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.editForm = async (req, res) => {
    const id = req.params.id
    let campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', { campground })
}


module.exports.updateCampground = async (req, res) => {
    const id = req.params.id

    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const { title, location, price, description, image } = req.body.campground
    const newC = await Campground.findByIdAndUpdate(id, { title, location, image, price, description })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newC.images.push( ... imgs)
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await newC.updateOne({$pull : {images : {filename : {$in : req.body.deleteImages}}}})
    }

    newC.geometry = geoData.body.features[0].geometry
    await newC.save()
    req.flash('success', 'Campground updated successfully!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted successfully')
    res.redirect('/campgrounds')
}
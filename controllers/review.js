const Review = require('../models/review')
const Campground = require('../models/campground')

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(req.params.id);
    const { rating, body } = req.body.review;
    const rev = new Review({ rating, body });
    rev.author = req.user._id
    await rev.save();
    camp.reviews.push(rev);
    await camp.save();
    req.flash('success', 'Review created successfully!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id } = req.params;
    const { reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!')
    res.redirect(`/campgrounds/${id}`)
}
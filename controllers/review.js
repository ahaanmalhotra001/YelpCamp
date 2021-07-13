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

module.exports.updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { rating, body } = req.body.review;
    rev = await Review.findById(reviewId);
    rev.rating = rating
    rev.body = body
    rev.save()

    req.flash('success', 'Review updates successfully!')
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.editForm = async (req, res) => {
    const reviewid = req.params.reviewId
    rev = await Review.findById(reviewid);
    if (!rev) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }

    const cmp = req.params.id

    res.render('reviews/edit', { rev, cmp })
}

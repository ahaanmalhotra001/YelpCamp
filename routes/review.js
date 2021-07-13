const express = require('express')
const router = express.Router({mergeParams : true})

const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/review')

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

router.put('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.updateReview))
router.get('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.editForm))

module.exports = router
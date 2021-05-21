const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 100; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random())*30;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: '60a3f5cf5eec2d4d0cd09b4a' ,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/drek0cqwy/image/upload/v1621487940/YelpCamp/dlxqcl8jyy87vumzwnhw.jpg',
                    filename: 'YelpCamp/dlxqcl8jyy87vumzwnhw'
                }
            ],
            price : price,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.Obcaecati provident totam, quas eveniet nam quae, nesciunt enim, reprehenderit quia nisi exercitationem impedit possimus dignissimos nulla.Odit ducimus dolor dignissimos praesentium.'
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
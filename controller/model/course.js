const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Course = new Schema({
    img: { type: String},
    nameCourse: { type: String, required: true },
    description:{ type: String, required: true },
    classify:{ type: String, required: true },
    slug: { type: String, slug: 'nameCourse' },
    idVideo: { type: Array},
    nameLesson: { type: Array},
    numberStudents: { type: Number, default: 0},
    commentId:[{
        type: String,
        ref: "comments"
    }],
    teacher: {
        type: String,
        ref: "users"
    }
},{
    timestamps:true,
});

module.exports = mongoose.model('courses', Course);
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const clearHash=require('../middlewares/clearHash')
const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id }).cache({key:req.user.id});

    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, clearHash,async (req, res) => {
    const { title, content,imageUrl } = req.body;

    const blog = new Blog({
      title,
      content,
      imageUrl,
      _user: req.user.id
    });

    //If you pass anything to the next() function (except the string 'route'), Express regards the current request
    //as being an error and will skip any remaining non-error handling routing and middleware functions.

    try {
      await blog.save();
      res.send(blog);
      
    } catch (err) {
      res.send(400, err);
    }
    //clearHash(req.user.id) write a middleware for this to make this a bit more automatic
  });
};

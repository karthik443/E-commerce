const User = require('../models/user');

const flash = require('connect-flash')

const bcrypt = require('bcrypt')
exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMsg: req.flash('errorMsg')
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('errorMsg', 'invalid email or password')
        return res.redirect('/login')
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.redirect('/login')
        })
        .catch(err => {
          console.log(err)
        })

    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password
  // console.log('im inside')

  User.findOne({ email: email }).then(userobject => {

    if (userobject) {
      return res.redirect('/signup')
    }
    return bcrypt.hash(password, 12)
      .then(password => {
        const user = new User({
          email: email,
          password: password,
          cart: {
            items: []
          }
        })
        return user.save()
      })
      .then(result => {
        console.log('im redirected to login page')
        res.redirect('/login')
      }
      )

  }).catch(err => {
    console.log(err)
  })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

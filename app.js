var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var app = express();

/*var logger = function (req, res, next) {
    console.log('Logging...');
    next();
}
app.use(logger);*/

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static path
app.use(express.static(path.join(__dirname, 'public')));

// Global variables
app.use((req, res, next) => {
    res.locals.errors = null;
    next();
});

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// main route
app.get('/', (req, res) => {
    db.users.find((err, docs) => {
        console.log(docs);
        res.render('index', {
            title: 'Customers',
            users: docs
        });
    });
});

app.post('/users/add', (req, res) => {

    req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('last_name', 'Last name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        res.render('index', {
            title: 'Customers',
            users: users,
            errors: errors
        });
    } else {
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }
    
        console.log(newUser);

        db.users.insert(newUser, (err, result) => {
            if(err) {
                console.log(err);
            }
            res.redirect('/');
        });
    }

});

app.delete('/users/delete/:id', (req, res) => {
    db.users.remove({_id: ObjectId(req.params.id)}, (err, result) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
    console.log(req.params.id);
});

app.listen(3000, () => {
    console.log('server started by express');
});
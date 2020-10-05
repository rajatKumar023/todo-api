const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {Todo} = require('./models/todo');
const {authenticate} = require('./middleware/authenticate')

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    const todo = new Todo({
        text: req.body.text,
        _creator: req.user._id,
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({_creator: req.user._id}).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id,
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id,
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send(todo);
    }).catch((e) => {
        res.status(400).send();
    });
});

app.put('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }
    const body = _.pick(req.body, ['text', 'completed']);

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        return res.status(400).send();
    });
});

app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password', 'name', 'bio', 'phone', 'profileImage']);
    const user = User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

app.get('/users/mobile/:mobile', (req, res) => {
    const mobile = req.params.mobile;
    if (!mobile.isNumber) {
        return res.status(404).send();
    }

    User.findOne({
        phone: mobile,
    }).then((user) => {
        if (!user) {
            return res.status(404).send();
        }

        res.send({user});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    User.findOne({
        _id: id,
    }).then((user) => {
        if (!user) {
            return res.status(404).send();
        }

        res.send({user});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.get('/users', (req, res) => {
    User.find().then((users) => {
        res.send({users});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    User.findOneAndRemove({
        _id: id,
    }).then((user) => {
        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    }).catch((e) => {
        res.status(400).send();
    });
});


app.listen(port, () => {
    console.log(`Started on port ${port}`);
});
















var superagent = require('superagent');

module.exports = function(app) {
  app.get('/chat', function(req, res) {
    res.render('chat');
  });

  app.get('/api', function(req, res) {
    res.send({
      simple: {
        href: '/api/simple'
      },
      'link-title': {
        href: '/api/nowhere',
        title: 'Link title'
      },
      items: {
        href: '/api/items'
      },
      user: {
        href: '/api/users/123'
      },
      'error-form': {
        method: 'POST',
        action: '/api'
      },
      messages: {
        href: '/api/messages'
      }
    });
  });

  app.post('/api', function(req, res) {
    res.send(500, {
      error: {
        message: 'Uh oh!'
      }
    });
  });

  app.get('/api/simple', function(req, res) {
    res.send({
      text: 'simple text'
    });
  });

  app.get('/api/items', function(req, res) {
    res.send({
      data: [
        {href: '/api/items/1'},
        {href: '/api/items/2'},
        {href: '/api/items/3'},
        {href: '/api/items/4'}
      ],
      property: 'hello!',
      search: {
        method: 'GET',
        action: '/api/items',
        input: {
          query: {
            type: 'text'
          }
        }
      },
      create: {
        method: 'POST',
        action: '/api/items',
        input: {
          title: {
            type: 'text'
          }
        }
      },
      select: {
        method: 'POST',
        action: '/api/items',
        input: {
          choices: {
            type: 'select',
            options: [
              {value: '1', text: 'first'},
              {value: '2', text: 'second'},
              {value: '3', text: 'third'}
            ]
          }
        }
      }
    });
  });

  app.get('/api/items/:id', function(req, res) {
    res.send({
      title: 'item' + req.params.id
    });
  });

  app.get('/api/users/:user', function(req, res) {
    res.send({
      href: '/api/users/' + req.params.user,
      name: 'richard',
      picture: {
        type: 'image/jpg',
        src: 'http://imgur.com/IoH1kN2l.jpg'
      },
      address: {
        street: '123 Gnu St.'
      },
      pictures: {
        type: 'image/jpg',
        src: [
          {src: 'http://imgur.com/IoH1kN2s.jpg', size: '600w'},
          {src: 'http://imgur.com/IoH1kN2l.jpg'}
        ]
      }
    });
  });

  var messages = {};
  app.get('/api/messages', function(req, res) {
    res.send({
      data: Object.keys(messages).map(function(message) {
        return {
          href: '/api/messages/' + message
        };
      }),
      create: {
        method: 'POST',
        action: '/api/messages',
        input: {
          text: {
            type: 'text'
          }
        }
      }
    });
  });

  app.post('/api/messages', function(req, res) {
    req.body.author = randomID();
    var id = randomID();
    messages[id] = req.body;
    res.redirect('/api/messages/' + id);
    superagent
      .post('http://hyper-emitter.herokuapp.com')
      .send({url: '/api/messages'})
      .end(function(){});
  });

  app.param('message', function(req, res, next, id) {
    var message = messages[id];
    if (!message) return res.send(404);
    req.message = message;
    next();
  });

  app.get('/api/messages/:message', function(req, res) {
    res.send({
      text: req.message.text,
      author: {
        href: '/api/users/' + req.message.author
      }
    });
  });
};

function randomID() {
  return Math.floor(Math.random() * 99999999999);
}

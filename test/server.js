
module.exports = function(app) {
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
        href: '/api/user'
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
      }
    });
  });

  app.get('/api/items/:id', function(req, res) {
    res.send({
      title: 'item' + req.params.id
    });
  });

  app.get('/api/user', function(req, res) {
    res.send({
      href: '/api/user',
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
};

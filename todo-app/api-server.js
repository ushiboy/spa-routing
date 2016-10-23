module.exports = runApiServer;

const Todo = {
  __ID_SEED__: 0,
  _items: new Map(),

  add(title) {
    const id = ++this.__ID_SEED__;
    this._items.set(id, title);
    return { id, title };
  },

  get(id) {
    if (this._items.has(id)) {
      const title = this._items.get(id);
      return { id, title };
    }
    return null;
  },

  getAll() {
    return Array.from(this._items).map(r => {
      return { id: r[0], title: r[1] };
    });
  },

  update(id, title) {
    if (this._items.has(id)) {
      this._items.set(id, title);
      return { id, title };
    }
    return null;
  },

  remove(id) {
    return this._items.delete(id);
  }

};

function runApiServer(port) {
  port = port || 3001;
  const express = require('express')
    , bodyParser = require('body-parser')
    , app = express();
  app.use(bodyParser.json());

  Todo.add('Item 1');
  Todo.add('Item 2');
  Todo.add('Item 3');
  Todo.add('Item 4');
  Todo.add('Item 5');

  app.get('/api/todos', (req, res) => {
    const todos = Todo.getAll();
    res.json({ todos });
  });
  app.post('/api/todos', (req, res) => {
    const todo = Todo.add(req.body.title);
    res.status(201).json(todo);
  });
  app.get('/api/todos/:id', (req, res) => {
    const todo = Todo.get(Number(req.params.id));
    if (todo !== null) {
      res.json(todo);
    } else {
      res.status(404).end();
    }
  });
  app.put('/api/todos/:id', (req, res) => {
    const todo = Todo.update(Number(req.params.id), req.body.title);
    if (todo !== null) {
      res.json(todo);
    } else {
      res.status(404).end();
    }
  });
  app.delete('/api/todos/:id', (req, res) => {
    if (Todo.remove(Number(req.params.id))) {
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  });
  app.listen(port);
}

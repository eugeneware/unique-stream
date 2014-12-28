# unique-stream

node.js through stream that emits a unique stream of objects based on criteria

[![build status](https://secure.travis-ci.org/eugeneware/unique-stream.png)](http://travis-ci.org/eugeneware/unique-stream)

## Installation

Install via npm:

```
$ npm install unique-stream
```

## Examples

### Dedupe a ReadStream based on JSON.stringify:

``` js
var unique = require('unique-stream')
  , Stream = require('stream');

// return a stream of 3 identical objects
function makeStreamOfObjects() {
  var s = new Stream;
  s.readable = true;
  var count = 3;
  for (var i = 0; i < 3; i++) {
    setImmediate(function () {
      s.emit('data', { name: 'Bob', number: 123 });
      --count && end();
    });
  }

  function end() {
    s.emit('end');
  }

  return s;
}

// Will only print out one object as the rest are dupes. (Uses JSON.stringify)
makeStreamOfObjects()
  .pipe(unique())
  .on('data', console.log);

```

### Dedupe a ReadStream based on an object property:

``` js
// Use name as the key field to dedupe on. Will only print one object
makeStreamOfObjects()
  .pipe(unique('name'))
  .on('data', console.log);
```

### Dedupe a ReadStream based on a custom function:

``` js
// Use a custom function to dedupe on. Use the 'number' field. Will only print one object.
makeStreamOfObjects()
  .pipe(function (data) {
    return data.number;
  })
  .on('data', console.log);
```

## Dedupe multiple streams

The reason I wrote this was to dedupe multiple object streams:

``` js
var aggregator = unique();

// Stream 1
makeStreamOfObjects()
  .pipe(aggregator);

// Stream 2
makeStreamOfObjects()
  .pipe(aggregator);

// Stream 3
makeStreamOfObjects()
  .pipe(aggregator);

aggregator.on('data', console.log);
```

## Use a custom store to record keys that have been encountered

By default a set is used to store keys encountered so far, in order to check new ones for
uniqueness. You can supply your own store instead, providing it supports the add(key) and 
has(key) methods. This could allow you to use a persistant store so that already encountered
objects are not re-streamed when node is reloaded.

``` js
var keyStore = {
  store: {},

  add: function(key) {
    this.store[key] = true;
  },

  has: function(key) {
    return this.store[key] !== undefined;
  }
};
    
makeStreamOfObjects()
  .pipe(unique('name', keyStore))
  .on('data', console.log);
```


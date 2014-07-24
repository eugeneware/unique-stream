var Stream = require('stream');
var wait = require('wait');

function prop(propName) {
  return function (data) {
    return data[propName];
  };
}

module.exports = unique;
function unique(propName, clear_ms) {
  var keyfn = JSON.stringify;
  if (typeof propName === 'string') {
    keyfn = prop(propName);
  } else if (typeof propName === 'function') {
    keyfn = propName;
  }
  var seen = {};
  wait.repeat(clear_ms, function() {
      seen = {};
  });

  var s = new Stream();
  s.readable = true;
  s.writable = true;
  var pipes = 0;

  s.write = function (data) {
    var key = keyfn(data);
    if (seen[key] === undefined) {
      seen[key] = true;
      s.emit('data', data);
    }
  };

  var ended = 0;
  s.end = function (data) {
    if (arguments.length) s.write(data);
    ended++;
    if (ended === pipes || pipes === 0) {
      s.writable = false;
      s.emit('end');
    }
  };

  s.destroy = function (data) {
    s.writable = false;
  };

  s.on('pipe', function () {
    pipes++;
  });

  s.on('unpipe', function () {
    pipes--;
  });

  return s;
}

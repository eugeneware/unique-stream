'use strict';

const filter = require('through2-filter').obj;
const stringify = require("json-stable-stringify-without-jsonify");

function prop(propName) {
  return function (data) {
    return data[propName];
  };
}

module.exports = unique;
function unique(propName, keyStore) {
  keyStore = keyStore || new Set();

  let keyfn = stringify;
  if (typeof propName === 'string') {
    keyfn = prop(propName);
  } else if (typeof propName === 'function') {
    keyfn = propName;
  }

  return filter(function (data) {
    const key = keyfn(data);

    if (keyStore.has(key)) {
      return false;
    }

    keyStore.add(key);
    return true;
  });
}

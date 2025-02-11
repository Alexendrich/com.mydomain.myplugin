/**
 * Copyright 2021-2022 Flarego Technologies Corp. <business@flarego.ph>
 * @file             : basic-http.js
 * @author           : Adones Pitogo <pitogo.adones@gmail.com>
 * Date              : Nov 29, 2022
 * Last Modified Date: Feb 27, 2024

 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
var BasicHttp = (function () {
  function httpClient() {
    return window.ActiveXObject
      ? new window.ActiveXObject('Microsoft.XMLHTTP')
      : new window.XMLHttpRequest();
  }

  function setHeaders(client, headers) {
    client.setRequestHeader('Accept', 'application/json');
    if (!headers) return;

    for (var key in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, key)) {
        client.setRequestHeader(key, headers[key]);
      }
    }
  }

  function combineOpts(opts1, opts2) {
    for (var key in opts2) {
      if (Object.prototype.hasOwnProperty.call(opts2, key)) {
        opts1[key] = opts2[key];
      }
    }
    return opts1;
  }

  function isDataValid(data) {
    if (!data) return false;
    try {
      if (Object.keys(data).length === 0) return false;
    } catch (_) {}
    return true;
  }

  function serialize(obj) {
    if (!isDataValid(obj)) return '';

    var str = [];
    for (var p in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }
    return str.join('&');
  }

  function handleError(errorCb, client) {
    var body = client.response || client.responseText;
    var error = 'Something went wrong';

    if (
      (client.status === 401 || client.status === 403) &&
      typeof http.onUnauthorized === 'function'
    ) {
      http.onUnauthorized({ error: error });
    }

    if (body) {
      try {
        var data = JSON.parse(body);
        errorCb(data);
      } catch (e) {
        console.error(e);
        errorCb({ error: error });
      }
    } else {
      errorCb(client);
    }
  }

  function Ajax(opts) {
    var noop = function () {
      console.warn('http callback not defined');
    };

    var headers = opts.headers || {};
    var method = (opts.method || 'GET').toUpperCase();
    var url = opts.url;
    var data = opts.data;
    var successCb = opts.success || noop;
    var errorCb = opts.error || noop;

    var client = httpClient();

    client.onreadystatechange = function () {
      if (client.readyState === 4) {
        if (client.status >= 200 && client.status < 400) {
          try {
            var data = JSON.parse(client.responseText);
            successCb(data);
          } catch (e) {
            console.error(e);
            handleError(errorCb, client);
          }
        } else {
          handleError(errorCb, client);
        }
      }
    };

    if (method === 'GET') {
      try {
        if (isDataValid(data)) {
          url += url.indexOf('?') > -1 ? '&' : '?';
          url += serialize(data);
        }
        client.open(method, url, true);
        setHeaders(client, headers);
        client.send();
      } catch (e) {
        handleError(errorCb, client);
      }
    } else if (method === 'POST') {
      try {
        data = data || {};
        client.open(method, url, true);
        setHeaders(client, headers);
        var params = JSON.stringify(data);
        client.send(params);
      } catch (e) {
        handleError(errorCb, client);
      }
    } else {
      console.error('Unsupported method:', method);
    }
  }

  var http = {};

  http.GetJson = function (url, data, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      try {
        Ajax(
          combineOpts(opts, {
            url: url,
            data: data,
            success: resolve,
            error: reject
          })
        );
      } catch (e) {
        console.error(e);
        cb(e);
      }
    });
  };

  http.PostJson = function (url, data, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      try {
        Ajax(
          combineOpts(opts, {
            method: 'POST',
            url: url,
            data: data,
            success: function (data) {
              resolve(data);
            },
            error: function (e) {
              reject(e);
            }
          })
        );
      } catch (e) {
        callback(e);
      }
    });
  };

  http.onUnauthorized = function (err) {
    console.error('Unauthorezed Error!', err);
  };

  return http;
})();

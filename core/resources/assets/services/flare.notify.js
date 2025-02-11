/**
 * @file             : notify.js
 * @author           : Adones Pitogo <pitogo.adones@flarego.com>
 * Date              : Jan 22, 2024
 * Last Modified Date: Feb 27, 2024
 * Copyright 2021-2024 Flarego Technologies Corp. <business@flarego.ph>

 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
(function (window) {
  var $flare = window.$flare;
  var colorSuccess = '#1fad45';
  var colorInfo = '#0581f5';
  var colorWarning = '#eb8634';
  var colorError = '#c72020';

  $flare.notify = {
    success: function (msg) {
      return createToast('success', msg);
    },
    info: function (msg) {
      return createToast('info', msg);
    },
    warning: function (msg) {
      return createToast('warning', msg);
    },
    error: function (msg) {
      return createToast('error', msg);
    }
  };

  function createToast(msgType, msg) {
    var color =
      msgType === 'success'
        ? colorSuccess
        : msgType === 'info'
        ? colorInfo
        : msgType === 'warning'
        ? colorWarning
        : msgType === 'error'
        ? colorError
        : 'gray';

    var t = Toastify({
      text: msg,
      duration: 5000,
      newWindow: true,
      close: false,
      gravity: 'top', // `top` or `bottom`
      position: 'center', // `left`, `center` or `right`
      style: { background: color },
      stopOnFocus: true, // Prevents dismissing of toast on hover,
      onClick: function () {
        if (t) {
          t.hideToast();
        }
      }
    }).showToast();

    return t;
  }
})(window);

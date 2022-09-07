import React, { createContext, useState, useEffect, useContext } from 'react';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var rngBrowser = createCommonjsModule(function (module) {
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}
});

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

var bytesToUuid_1 = bytesToUuid;

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rngBrowser();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid_1(b);
}

var v1_1 = v1;

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rngBrowser)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid_1(rnds);
}

var v4_1 = v4;

var uuid = v4_1;
uuid.v1 = v1_1;
uuid.v4 = v4_1;

var uuid_1 = uuid;

function getAnimationClass(string) {
  var className = 'default';

  switch (string) {
    case 'left':
      className = 'left';
      break;

    case 'right':
      className = 'right';
      break;

    case 'leftRight':
      className = 'left-right';
      break;
  }

  return className;
}

var styles = {"test":"_2SPBi","notification":"_2V--r","default":"_133R1","showHideVertical":"_UAdhu","left":"_2SVjA","showHideLeft":"_3fbPQ","right":"_1-JL1","showHideRight":"_Rarvj","left-right":"_1Urre","showHideLR":"_2vVca","default-notification":"_13MaP"};

function emptyNotification() {
  return {
    id: null,
    message: null,
    severity: null
  };
}

var NotificationBarContext = createContext(null);
var NotificationBarProvider = function NotificationBarProvider(_ref) {
  var children = _ref.children,
      animationDirection = _ref.animationDirection,
      col = _ref.col,
      row = _ref.row,
      render = _ref.render;

  var _useState = useState(emptyNotification()),
      newNotification = _useState[0],
      setNewNotification = _useState[1];

  var _useState2 = useState([]),
      notifications = _useState2[0],
      setNotifications = _useState2[1];

  var pushNotification = function pushNotification(message, severity) {
    setNewNotification(function () {
      return {
        message: message,
        id: uuid_1.v4(),
        severity: severity
      };
    });
  };

  var returnValues = {
    pushNotification: pushNotification,
    notifications: notifications
  };
  return React.createElement(NotificationBarContext.Provider, {
    value: returnValues
  }, React.createElement(SnackBar, {
    col: col,
    row: row,
    notifications: notifications,
    setNotifications: setNotifications,
    newNotification: newNotification,
    animationDirection: animationDirection || 'default',
    render: render
  }), children);
};

var SnackBar = function SnackBar(props) {
  var notifications = props.notifications,
      setNotifications = props.setNotifications,
      newNotification = props.newNotification,
      animationDirection = props.animationDirection,
      col = props.col,
      row = props.row;
  useEffect(function () {
    if (newNotification.id !== null) setNotifications(function (state) {
      return [].concat(state, [newNotification]);
    });
  }, [newNotification]);

  var removeNotification = function removeNotification() {
    notifications.shift();
    setNotifications([].concat(notifications));
  };

  return React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: row || 'start',
      alignItems: col || 'start',
      flexDirection: 'column',
      gap: '1rem',
      position: 'fixed',
      zIndex: 9999,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: '100vw',
      maxHeight: '100vh',
      overflow: 'auto',
      pointerEvents: 'none',
      padding: '40px',
      transition: '1s ease'
    }
  }, notifications.map(function (notification) {
    return React.createElement("div", {
      key: notification.id,
      onAnimationEnd: removeNotification
    }, React.createElement(NotificationContainer, {
      animationDirection: animationDirection
    }, props.render ? props.render({
      notification: notification
    }) : React.createElement(Notification, null, notification.message)));
  }));
};

var NotificationContainer = function NotificationContainer(props) {
  var animationDirection = props.animationDirection,
      children = props.children;
  return React.createElement("div", {
    className: "custom-notification-properties " + styles.notification + " " + styles[getAnimationClass(animationDirection)]
  }, children);
};

var Notification = function Notification(_ref2) {
  var children = _ref2.children;
  return React.createElement("div", {
    className: styles['default-notification']
  }, children);
};

var useNotificationBar = function useNotificationBar() {
  var notificationContext = useContext(NotificationBarContext);

  if (notificationContext === null) {
    throw new Error('Please wrap parent component with NotificationProvider and use this hook in child component.');
  }

  return notificationContext;
};

export { NotificationBarProvider, useNotificationBar };
//# sourceMappingURL=index.modern.js.map

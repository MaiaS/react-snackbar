function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);

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

var NotificationBarContext = React.createContext(null);
var NotificationBarProvider = function NotificationBarProvider(_ref) {
  var children = _ref.children,
      animationDirection = _ref.animationDirection,
      col = _ref.col,
      row = _ref.row,
      render = _ref.render;
  var counterRef = React.useRef(0);

  var _useState = React.useState(emptyNotification()),
      newNotification = _useState[0],
      setNewNotification = _useState[1];

  var _useState2 = React.useState([]),
      notifications = _useState2[0],
      setNotifications = _useState2[1];

  var pushNotification = function pushNotification(message, severity) {
    setNewNotification(function () {
      return {
        message: message,
        id: counterRef.current,
        severity: severity
      };
    });
    counterRef.current += 1;
  };

  var returnValues = {
    pushNotification: pushNotification,
    notifications: notifications
  };
  return React__default.createElement(NotificationBarContext.Provider, {
    value: returnValues
  }, React__default.createElement(SnackBar, {
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
  React.useEffect(function () {
    if (newNotification.id !== null) setNotifications(function (state) {
      return [].concat(state, [newNotification]);
    });
  }, [newNotification]);

  var removeNotification = function removeNotification() {
    notifications.shift();
    setNotifications([].concat(notifications));
  };

  return React__default.createElement("div", {
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
    return React__default.createElement("div", {
      key: notification.id,
      onAnimationEnd: removeNotification
    }, React__default.createElement(NotificationContainer, {
      animationDirection: animationDirection
    }, props.render ? props.render({
      notification: notification
    }) : React__default.createElement(Notification, null, notification.message)));
  }));
};

var NotificationContainer = function NotificationContainer(props) {
  var animationDirection = props.animationDirection,
      children = props.children;
  return React__default.createElement("div", {
    className: "custom-notification-properties " + styles.notification + " " + styles[getAnimationClass(animationDirection)]
  }, children);
};

var Notification = function Notification(_ref2) {
  var children = _ref2.children;
  return React__default.createElement("div", {
    className: styles['default-notification']
  }, children);
};

var useNotificationBar = function useNotificationBar() {
  var notificationContext = React.useContext(NotificationBarContext);

  if (notificationContext === undefined) {
    throw new Error('Please wrap parent component with NotificationProvider and use this in child component.');
  }

  return notificationContext;
};

exports.NotificationBarProvider = NotificationBarProvider;
exports.useNotificationBar = useNotificationBar;
//# sourceMappingURL=index.js.map

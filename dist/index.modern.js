import React, { createContext, useRef, useState, useEffect, useContext } from 'react';

function getAnimationClass(string) {
  let className = 'default';

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

var styles = {"test":"_styles-module__test__2SPBi","notification":"_styles-module__notification__2V--r","default":"_styles-module__default__133R1","showHideVertical":"_styles-module__showHideVertical__UAdhu","left":"_styles-module__left__2SVjA","showHideLeft":"_styles-module__showHideLeft__3fbPQ","right":"_styles-module__right__1-JL1","showHideRight":"_styles-module__showHideRight__Rarvj","left-right":"_styles-module__left-right__1Urre","showHideLR":"_styles-module__showHideLR__2vVca","default-notification":"_styles-module__default-notification__13MaP"};

function emptyNotification() {
  return {
    id: null,
    message: null,
    severity: null
  };
}

const NotificationBarContext = createContext(null);
const NotificationBarProvider = ({
  children,
  animationDirection,
  col,
  row,
  render
}) => {
  const counterRef = useRef(0);
  const [newNotification, setNewNotification] = useState(emptyNotification());
  const [notifications, setNotifications] = useState([]);

  const pushNotification = (message, severity) => {
    setNewNotification(() => ({
      message: message,
      id: counterRef.current,
      severity: severity
    }));
    counterRef.current += 1;
  };

  const returnValues = {
    pushNotification,
    notifications
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

const SnackBar = props => {
  const {
    notifications,
    setNotifications,
    newNotification,
    animationDirection,
    col,
    row
  } = props;
  useEffect(() => {
    if (newNotification.id !== null) setNotifications(state => [...state, newNotification]);
  }, [newNotification]);

  const removeNotification = () => {
    notifications.shift();
    setNotifications([...notifications]);
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
  }, notifications.map(notification => React.createElement("div", {
    key: notification.id,
    onAnimationEnd: removeNotification
  }, React.createElement(NotificationContainer, {
    animationDirection: animationDirection
  }, props.render ? props.render({
    notification
  }) : React.createElement(Notification, null, notification.message)))));
};

const NotificationContainer = props => {
  const {
    animationDirection,
    children
  } = props;
  return React.createElement("div", {
    className: `custom-notification-properties ${styles.notification} ${styles[getAnimationClass(animationDirection)]}`
  }, children);
};

const Notification = ({
  children
}) => {
  return React.createElement("div", {
    className: styles['default-notification']
  }, children);
};

const useNotificationBar = () => {
  const notificationContext = useContext(NotificationBarContext);

  if (notificationContext === undefined) {
    throw new Error('Please wrap parent component with NotificationProvider and use this in child component.');
  }

  return notificationContext;
};

export { NotificationBarProvider, useNotificationBar };
//# sourceMappingURL=index.modern.js.map

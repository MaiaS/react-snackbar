import React, { useEffect, useRef, useState, createContext } from 'react'
import { getAnimationClass } from '../util/getClassName'
import styles from './styles.module.css'

type Props = {
  render?: (ctx: {
    notification: NotificationObject | null
  }) => React.ReactElement
  col?: 'start' | 'flex-start' | 'center' | 'flex-end' | 'end'
  row?: 'start' | 'flex-start' | 'center' | 'flex-end' | 'end'
  newNotification: NotificationObject
  animationDirection: AnimationString
  notifications: NotificationObject[]
  setNotifications: React.Dispatch<React.SetStateAction<NotificationObject[]>>
}

function emptyNotification(): NotificationObject {
  return {
    id: null,
    message: null,
    severity: null
  }
}

export const NotificationBarContext = createContext<ContextInterface | null>(
  null
)

type ProviderProps = {
  col?: 'start' | 'flex-start' | 'center' | 'flex-end' | 'end'
  row?: 'start' | 'flex-start' | 'center' | 'flex-end' | 'end'
  animationDirection?: AnimationString
  render?: (ctx: {
    notification: NotificationObject | null
  }) => React.ReactElement
}

export const NotificationBarProvider: React.FC<ProviderProps> = ({
  children,
  animationDirection,
  col,
  row,
  render
}) => {
  const counterRef = useRef(0)
  const [newNotification, setNewNotification] = useState<NotificationObject>(
    emptyNotification()
  )
  const [notifications, setNotifications] = useState<NotificationObject[]>([])

  const pushNotification = (message: string, severity?: number) => {
    setNewNotification(() => ({
      message: message,
      id: counterRef.current,
      severity: severity
    }))
    counterRef.current += 1
  }

  const returnValues = { pushNotification, notifications }

  return (
    <NotificationBarContext.Provider value={returnValues}>
      <SnackBar
        col={col}
        row={row}
        notifications={notifications}
        setNotifications={setNotifications}
        newNotification={newNotification}
        animationDirection={animationDirection || 'default'}
        render={render}
      />
      {children}
    </NotificationBarContext.Provider>
  )
}

const SnackBar: React.FC<Props> = (props) => {
  const {
    notifications,
    setNotifications,
    newNotification,
    animationDirection,
    col,
    row
  } = props

  useEffect(() => {
    if (newNotification.id !== null)
      setNotifications((state) => [...state, newNotification])
  }, [newNotification])

  const removeNotification = () => {
    notifications.shift()
    setNotifications([...notifications])
  }

  return (
    <div
      style={{
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
      }}
    >
      {notifications.map((notification) => (
        <div key={notification.id} onAnimationEnd={removeNotification}>
          <NotificationContainer animationDirection={animationDirection}>
            {props.render ? (
              props.render({
                notification
              })
            ) : (
              <Notification>{notification.message}</Notification>
            )}
          </NotificationContainer>
        </div>
      ))}
    </div>
  )
}

type NotificationProps = {
  animationDirection: AnimationString
}

const NotificationContainer: React.FC<NotificationProps> = (props) => {
  const { animationDirection, children } = props
  return (
    <div
      className={`custom-notification-properties ${styles.notification} ${
        styles[getAnimationClass(animationDirection)]
      }`}
    >
      {children}
    </div>
  )
}

export const Notification: React.FC = ({ children }) => {
  return <div className={styles['default-notification']}>{children}</div>
}

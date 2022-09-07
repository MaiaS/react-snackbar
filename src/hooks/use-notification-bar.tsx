import { useContext } from 'react'
import { NotificationBarContext } from '../context'
// import styles from './styles.module.css'

export const useNotificationBar = () => {
  // Wrap context in custom hook for cleaner and easier usage
  const notificationContext = useContext(NotificationBarContext)

  if (notificationContext === undefined) {
    throw new Error(
      'Please wrap parent component with NotificationProvider and use this in child component.'
    )
  }

  return notificationContext
}

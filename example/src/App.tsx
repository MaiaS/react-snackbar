/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react'

import { NotificationBarProvider, useNotificationBar } from 'react-snackbar'
import 'react-snackbar/dist/index.css'

const App = () => {
  return (
    <>
      <NotificationBarProvider
        col='start'
        row='end'
        animationDirection={'leftRight'}
        render={({ notification }) => <TestNotification {...notification} />}
      >
        <Test />
      </NotificationBarProvider>
    </>
  )
}

const TestNotification = ({ message = '', severity = 0 }) => {
  return (
    <div
      style={{
        background:
          severity === 0
            ? 'lightGreen'
            : severity === 1
            ? 'lightYellow'
            : 'salmon',
        minHeight: '20px',
        borderRadius: '8px',
        padding: '10px 20px',
        minWidth: '40px',
        maxWidth: '500px',
        width: 'fit-content',
        fontFamily: 'helvetica',
        fontWeight: 900,
        border: '1px solid green'
      }}
    >
      {message}
    </div>
  )
}

const Test = () => {
  const { pushNotification } = useNotificationBar() || {}

  const randomMessage = () => {
    pushNotification(Math.random() * 100, Math.floor(Math.random() * 3))
  }
  return (
    <>
      <div
        style={{
          padding: '50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <p> Click button to add notifications!</p>
        <button onClick={randomMessage}>Click to Add</button>
      </div>
    </>
  )
}

export default App

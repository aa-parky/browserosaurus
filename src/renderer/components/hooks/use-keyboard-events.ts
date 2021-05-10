import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { AppThunk } from '../../store'
import {
  pressedAppKey,
  pressedBackspaceKey,
  pressedCopyKey,
  pressedEscapeKey,
} from '../../store/actions'

const keyboardEvent =
  (event: KeyboardEvent): AppThunk =>
  (dispatch, getState) => {
    const { url, isEditMode, hotkeys, fav } = getState().ui

    const virtualKey = event.key.toLowerCase()
    // Not needed at the moment but useful to know
    // const physicalKey = event.code.toLowerCase()

    // Favourite hotkeys
    // Enter and space can cause previously focussed items to activate so are
    // therefore always disabled.
    if (virtualKey === ' ' || virtualKey === 'enter') {
      event.preventDefault()
    }

    // Escape
    if (virtualKey === 'escape') {
      dispatch(pressedEscapeKey())
    }

    // Only capture the following when not in edit mode
    if (!isEditMode) {
      // Backspace
      if (virtualKey === 'backspace') {
        event.preventDefault()
        dispatch(pressedBackspaceKey())
      }

      // ⌘C
      else if (event.metaKey && virtualKey === 'c') {
        event.preventDefault()
        if (url) {
          dispatch(pressedCopyKey(url))
        }
      }

      // App hotkey
      else if (!event.metaKey && /^([a-z0-9])$/u.test(virtualKey)) {
        event.preventDefault()
        const appId = hotkeys[virtualKey]
        if (appId) {
          dispatch(
            pressedAppKey({
              url,
              appId,
              isAlt: event.altKey,
              isShift: event.shiftKey,
            }),
          )
        }
      }

      // Favourite hotkeys
      else if (virtualKey === ' ' || virtualKey === 'enter') {
        event.preventDefault()
        dispatch(
          pressedAppKey({
            url,
            appId: fav,
            isAlt: event.altKey,
            isShift: event.shiftKey,
          }),
        )
      }
    }
  }

export const useKeyboardEvents = (): void => {
  const dispatch = useDispatch()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      dispatch(keyboardEvent(event))
    }

    document.addEventListener('keydown', handler)

    return function cleanup() {
      document.removeEventListener('keydown', handler)
    }
  }, [dispatch])
}

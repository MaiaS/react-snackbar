export function getAnimationClass(string: AnimationString): string {
  let className = 'default'
  switch (string) {
    case 'left':
      className = 'left'
      break

    case 'right':
      className = 'right'
      break
    case 'leftRight':
      className = 'left-right'
      break

    default:
      break
  }
  return className
}

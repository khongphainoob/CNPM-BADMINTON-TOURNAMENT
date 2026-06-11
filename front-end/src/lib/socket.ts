// No-op socket stub — app uses polling (setInterval) for live updates
export const socket = {
  connect: () => {},
  disconnect: () => {},
  on: (_event: string, _handler: () => void) => {},
  off: (_event: string, _handler: () => void) => {},
}

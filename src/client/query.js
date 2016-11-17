export default function query (q) {
  let [ idx, val, breakLoop, type ] = [ 0, null, false, null ]
  let [ chain, len, client ] = [ q._chain, q._chain.length, q._client ]

  for (let c of chain) {
    switch (c.method) {
      case 'logout':
        val = client.logout()
        breakLoop = true
        break

      case 'type':
        type = c.name
        break

      default:
        break
    }
    if (breakLoop) return val
    idx++
  }
  return val
}
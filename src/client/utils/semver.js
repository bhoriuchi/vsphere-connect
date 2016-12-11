export function parse (s) {
  let [ major, minor, patch ] = s.split('.')
  major = !isNaN(major) ? parseInt(major) : null
  minor = !minor ? 0 : !isNaN(minor) ? parseInt(minor) : null
  patch = !patch ? 0 : !isNaN(patch) ? parseInt(patch) : null
  if (!major) return null
  return {
    version: `${major}.${minor}.${patch}`,
    major,
    minor,
    patch
  }
}

export function gt (a, b) {
  let verA = parse(a)
  let verB = parse(b)
  if (verA.major < verB.major) return false
  if (verA.major === verB.major) {
    if (verA.minor < verB.minor) return false
    if (verA.minor === verB.minor) {
      if (verA.patch < verB.patch) return false
    }
  }
  return true
}

export function lt (a, b) {
  let verA = parse(a)
  let verB = parse(b)
  if (verA.major > verB.major) return false
  if (verA.major === verB.major) {
    if (verA.minor > verB.minor) return false
    if (verA.minor === verB.minor) {
      if (verA.patch > verB.patch) return false
    }
  }
  return true
}

export default {
  parse,
  gt,
  lt
}
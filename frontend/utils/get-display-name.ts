/**
 * getDisplayName:
 * - Utility function to extract a display name from a component or tag for debugging.
 */
export default function getDisplayName(componentOrTag: React.ElementType) {
  if (typeof componentOrTag === 'string') {
    return componentOrTag
  }
  return componentOrTag.displayName || componentOrTag.name || 'Unknown'
}

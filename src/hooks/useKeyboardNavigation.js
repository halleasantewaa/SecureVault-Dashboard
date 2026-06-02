import { useEffect, useCallback } from 'react'

// This hook handles all keyboard navigation for the file tree.
// It lives in its own file because it's a self-contained piece of logic
// that doesn't need to be mixed into the component code.
//
// How it works:
// We maintain a flat list of all VISIBLE nodes in the tree.
// "Visible" means the node itself is shown — its parent folders are expanded.
// When the user presses Up/Down, we move through that flat list.
// When they press Right/Left, we expand/collapse the focused folder.
// When they press Enter, we select the focused file.
//
// Props:
//   visibleNodes    — flat array of all currently visible nodes
//   focusedId       — id of the currently keyboard-focused node
//   setFocusedId    — updates the focused node
//   expandedIds     — Set of folder ids that are open
//   setExpandedIds  — updates which folders are open
//   onSelectFile    — fires when Enter is pressed on a file

function useKeyboardNavigation({
  visibleNodes,
  focusedId,
  setFocusedId,
  expandedIds,
  setExpandedIds,
  onSelectFile,
}) {

  const handleKeyDown = useCallback((e) => {

    // Don't hijack keyboard when user is typing in the search bar
    if (e.target.tagName === 'INPUT') return

    // Find where the currently focused node is in the visible list
    const currentIndex = visibleNodes.findIndex(n => n.id === focusedId)

    switch (e.key) {

      case 'ArrowDown': {
        e.preventDefault()
        // Move to the next item in the visible list
        const nextIndex = currentIndex + 1
        if (nextIndex < visibleNodes.length) {
          setFocusedId(visibleNodes[nextIndex].id)
        }
        break
      }

      case 'ArrowUp': {
        e.preventDefault()
        // Move to the previous item in the visible list
        const prevIndex = currentIndex - 1
        if (prevIndex >= 0) {
          setFocusedId(visibleNodes[prevIndex].id)
        }
        break
      }

      case 'ArrowRight': {
        e.preventDefault()
        const node = visibleNodes[currentIndex]
        if (!node) break
        // If it's a folder and it's closed, open it
        if (node.type === 'folder' && !expandedIds.has(node.id)) {
          setExpandedIds(prev => new Set([...prev, node.id]))
        }
        break
      }

      case 'ArrowLeft': {
        e.preventDefault()
        const node = visibleNodes[currentIndex]
        if (!node) break
        // If it's a folder and it's open, close it
        if (node.type === 'folder' && expandedIds.has(node.id)) {
          setExpandedIds(prev => {
            const next = new Set(prev)
            next.delete(node.id)
            return next
          })
        }
        break
      }

      case 'Enter': {
        e.preventDefault()
        const node = visibleNodes[currentIndex]
        if (!node) break
        // If it's a file, select it
        if (node.type === 'file') {
          onSelectFile(node)
        }
        // If it's a folder, toggle it
        if (node.type === 'folder') {
          setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(node.id)) {
              next.delete(node.id)
            } else {
              next.add(node.id)
            }
            return next
          })
        }
        break
      }

      default:
        break
    }

  }, [visibleNodes, focusedId, expandedIds, setFocusedId, setExpandedIds, onSelectFile])

  // Attach the keydown listener to the whole window
  // so it works no matter where focus is on the page
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export default useKeyboardNavigation
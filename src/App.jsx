import { useState, useCallback, useMemo } from 'react'
import AppHeader from './components/AppHeader'
import TreeView from './components/TreeView'
import PropertiesPanel from './components/PropertiesPanel'
import useKeyboardNavigation from './hooks/useKeyboardNavigation'
import data from './data/data.json'
import './App.css'

// ─── BREADCRUMB HELPER ────────────────────────────────────────────────────────
// Walks the tree recursively to find the full path to a node by its id.
// Returns an array of names from root to the target node.
// Example: ["SecureVault", "01_Legal_Department", "Active_Cases", "report.pdf"]

function findPath(nodes, targetId, path = ['SecureVault']) {
  for (const node of nodes) {
    const currentPath = [...path, node.name]
    if (node.id === targetId) return currentPath
    if (node.type === 'folder' && node.children) {
      const result = findPath(node.children, targetId, currentPath)
      if (result) return result
    }
  }
  return null
}

// ─── VISIBLE NODES HELPER ─────────────────────────────────────────────────────
// Builds a flat list of every node the user can currently see in the tree.
// A node is visible if all its parent folders are expanded.
// The keyboard hook uses this list to know what Up/Down should move between.

function getVisibleNodes(nodes, expandedIds, searchQuery) {
  const result = []

  for (const node of nodes) {
    // For search — only include files that match, and folders that
    // contain matching descendants
    if (searchQuery) {
      const matchesSearch = (n) => {
        if (n.type === 'file') {
          return n.name.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return n.children?.some(child => matchesSearch(child))
      }
      if (!matchesSearch(node)) continue
    }

    result.push(node)

    // If this folder is expanded, include its children too
    if (node.type === 'folder' && node.children) {
      const isExpanded = expandedIds.has(node.id) ||
        (searchQuery && node.children.some(child => {
          const matchesSearch = (n) => {
            if (n.type === 'file') return n.name.toLowerCase().includes(searchQuery.toLowerCase())
            return n.children?.some(c => matchesSearch(c))
          }
          return matchesSearch(child)
        }))

      if (isExpanded) {
        const childVisible = getVisibleNodes(node.children, expandedIds, searchQuery)
        result.push(...childVisible)
      }
    }
  }

  return result
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function App() {

  // The currently selected file node, or null if nothing selected
  const [selectedFile, setSelectedFile] = useState(null)

  // Current search string — empty means no search active
  const [searchQuery, setSearchQuery] = useState('')

  // Set of folder ids that are currently expanded.
  // Using a Set because checking membership (has) is O(1) — very fast.
  const [expandedIds, setExpandedIds] = useState(new Set())

  // The id of the node currently focused by keyboard navigation
  const [focusedId, setFocusedId] = useState(null)

  // Build the flat list of visible nodes for the keyboard hook.
  // useMemo means this only recalculates when expandedIds or searchQuery change
  // — not on every single render.
  const visibleNodes = useMemo(() =>
    getVisibleNodes(data, expandedIds, searchQuery),
    [expandedIds, searchQuery]
  )

  const handleSelectFile = useCallback((node) => {
    setSelectedFile(node)
    setFocusedId(node.id)
  }, [])

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  // Wire up keyboard navigation using our custom hook
  useKeyboardNavigation({
    visibleNodes,
    focusedId,
    setFocusedId,
    expandedIds,
    setExpandedIds,
    onSelectFile: handleSelectFile,
  })

  // Build the breadcrumb path for the selected file
  const breadcrumb = selectedFile
    ? findPath(data, selectedFile.id) || []
    : []

  return (
    <div className="app">

      <AppHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      <div className="app__body">

        <div className="app__sidebar">
          <div className="app__sidebar-label">SecureVault</div>
          <TreeView
            data={data}
            selectedId={selectedFile?.id}
            focusedId={focusedId}
            onSelectFile={handleSelectFile}
            searchQuery={searchQuery}
            expandedIds={expandedIds}
            setExpandedIds={setExpandedIds}
          />
        </div>

        <div className="app__panel">

          {/* Breadcrumb trail — wildcard feature.
              Each segment except the last is clickable.
              Clicking a folder segment scrolls the tree to that folder —
              for now it just highlights the path visually. */}
          {breadcrumb.length > 0 && (
            <div className="app__breadcrumb">
              {breadcrumb.map((segment, index) => (
                <span key={index} className="app__breadcrumb-item">
                  {index > 0 && (
                    <span className="app__breadcrumb-sep">/</span>
                  )}
                  <span
                    className={
                      index === breadcrumb.length - 1
                        ? 'app__breadcrumb-seg app__breadcrumb-seg--active'
                        : 'app__breadcrumb-seg'
                    }
                  >
                    {segment}
                  </span>
                </span>
              ))}
            </div>
          )}

          <PropertiesPanel
            selectedFile={selectedFile}
            breadcrumb={breadcrumb}
          />

        </div>

      </div>
    </div>
  )
}

export default App
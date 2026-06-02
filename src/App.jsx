import { useState, useCallback } from 'react'
import AppHeader from './components/AppHeader'
import TreeView from './components/TreeView'
import PropertiesPanel from './components/PropertiesPanel'
import data from './data/data.json'
import './App.css'

// ─── BREADCRUMB HELPER ────────────────────────────────────────────────────────
// This function takes the full data array and a target file id,
// and returns the path to that file as an array of names.
// Example: ["SecureVault", "01_Legal_Department", "Active_Cases", "report.pdf"]
//
// How it works: it's a recursive search through the tree.
// It goes into each folder, looks for the target id,
// and if it finds it, it builds the path on the way back out.

function findPath(nodes, targetId, path = ['SecureVault']) {
  for (const node of nodes) {
    // Build the current path by adding this node's name
    const currentPath = [...path, node.name]

    // If this node is the one we're looking for, we're done
    if (node.id === targetId) {
      return currentPath
    }

    // If it's a folder, search inside it
    if (node.type === 'folder' && node.children) {
      const result = findPath(node.children, targetId, currentPath)
      // If the search found something, pass it back up
      if (result) return result
    }
  }

  // Nothing found in this branch
  return null
}

// ─── APP ──────────────────────────────────────────────────────────────────────
// App is the top level component — the single source of truth.
// All shared state lives here and is passed down as props.
// No component below App needs to know about any other component.

function App() {

  // The currently selected file node (full object from data.json), or null
  const [selectedFile, setSelectedFile] = useState(null)

  // The current search string — empty string means no search active
  const [searchQuery, setSearchQuery] = useState('')

  // When a file is clicked in the tree, this function runs.
  // It updates selectedFile so PropertiesPanel knows what to show.
  const handleSelectFile = useCallback((node) => {
    setSelectedFile(node)
  }, [])

  // When the user types in the search bar, this updates searchQuery.
  // That value flows down to TreeView → TreeNode, which uses it
  // to filter files and auto-expand matching folders.
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  // Build the breadcrumb path for the selected file.
  // findPath walks the tree and returns the array of names.
  // If no file is selected, breadcrumb is an empty array.
  const breadcrumb = selectedFile
    ? findPath(data, selectedFile.id) || []
    : []

  return (
    <div className="app">

      {/* Top bar — logo + search */}
      <AppHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      {/* Main content area — tree on left, properties on right */}
      <div className="app__body">

        {/* Left sidebar — the file tree */}
        <div className="app__sidebar">

          {/* "SecureVault" root label above the tree */}
          <div className="app__sidebar-label">SecureVault</div>

          {/* The recursive tree — receives data and all handlers */}
          <TreeView
            data={data}
            selectedId={selectedFile?.id}
            onSelectFile={handleSelectFile}
            searchQuery={searchQuery}
          />

        </div>

        {/* Right panel — file properties + breadcrumb */}
        <div className="app__panel">

          {/* Breadcrumb trail — the wildcard feature.
              Shows the full path to the selected file at the top of the panel.
              Each segment is clickable in the design but here it shows the path. */}
          {breadcrumb.length > 0 && (
            <div className="app__breadcrumb">
              {breadcrumb.map((segment, index) => (
                <span key={index} className="app__breadcrumb-item">
                  {/* Show a separator before every segment except the first */}
                  {index > 0 && (
                    <span className="app__breadcrumb-sep">/</span>
                  )}
                  <span
                    className={
                      // Last segment is the file itself — style it differently
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

          {/* Properties panel — shows file details or empty state */}
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
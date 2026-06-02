import { useState } from 'react'
import './TreeNode.css'

// I'm pulling the file extension out of the filename directly
// instead of adding an extra field to the JSON — keeps the data clean
// Example: "report.pdf" → "pdf"
function getExtension(name) {
  return name.split('.').pop().toLowerCase()
}

// Each file extension maps to a colour from our design system.
// This is what drives the icon tint and the type label in the Properties panel.
function getFileColour(extension) {
  const map = {
    pdf:  'var(--danger)',    // red
    docx: 'var(--accent)',    // blue
    doc:  'var(--accent)',    // blue
    png:  'var(--warning)',   // orange
    jpg:  'var(--warning)',   // orange
    svg:  'var(--warning)',   // orange
    xlsx: 'var(--success)',   // green
    xls:  'var(--success)',   // green
    txt:  'var(--text-muted)',
    yaml: 'var(--text-muted)',
    ttf:  'var(--text-muted)',
  }
  // Unknown extensions fall back to grey
  return map[extension] || 'var(--text-muted)'
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
// Building these as small SVG components instead of importing an icon library
// — the brief says no external component libraries, so I rolled my own.

function FolderIcon({ colour }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  )
}

function FileIcon({ colour }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colour}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function ChevronIcon({ isOpen }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        // Rotating the chevron is cheaper than swapping between two icons
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.15s ease',
        flexShrink: 0,
      }}
    >
      <polyline points="4,2 8,6 4,10" />
    </svg>
  )
}

// ─── TREE NODE ────────────────────────────────────────────────────────────────
// This is the main recursive component — the heart of the whole project.
//
// The idea: a TreeNode renders one node from the data.
// If that node is a folder, it renders its children as more TreeNodes.
// Those children do the same thing. That's the recursion.
// It doesn't matter if the tree is 2 levels deep or 20 — it just works.
//
// Props:
//   node          — the current node object from data.json
//   selectedId    — id of the selected file, lives in App state
//   onSelectFile  — fires when a file is clicked, updates App state
//   depth         — tracks how deep we are, controls indentation
//   searchQuery   — current search string, used for auto-expanding folders

function TreeNode({ node, selectedId, onSelectFile, depth = 0, searchQuery }) {

  // isOpen tracks whether this specific folder is expanded or collapsed.
  // Each TreeNode manages its own open/closed state independently.
  const [isOpen, setIsOpen] = useState(false)

  // Every level of depth adds 20px of left padding.
  // This is how the visual hierarchy is created without any extra logic.
  const indentStyle = { paddingLeft: `${depth * 20}px` }


  // ── FOLDER ────────────────────────────────────────────────────────────────
  if (node.type === 'folder') {

    // For the search feature — I need to check if any file inside this folder
    // (or any of its subfolders) matches the search query.
    // If yes, I force this folder open so the matching file is visible.
    const hasMatchingDescendant = (node) => {
      if (!searchQuery) return false
      return node.children?.some(child => {
        if (child.type === 'file') {
          return child.name.toLowerCase().includes(searchQuery.toLowerCase())
        }
        // Keep checking deeper if the child is also a folder
        return hasMatchingDescendant(child)
      })
    }

    // The folder shows as open if the user clicked it,
    // OR if search found a match inside it
    const isExpanded = isOpen || hasMatchingDescendant(node)

    return (
      <div className="tree-node-wrapper">

        {/* Clickable folder row */}
        <div
          className="tree-node tree-node--folder"
          style={indentStyle}
          onClick={() => setIsOpen(prev => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(prev => !prev)
            }
          }}
        >
          <ChevronIcon isOpen={isExpanded} />
          <FolderIcon colour="#E3B341" />
          <span className="tree-node__name">{node.name}</span>
        </div>

        {/* Only render children when the folder is expanded.
            Each child is a new TreeNode — this is where the recursion happens.
            depth + 1 increases the indent for the next level. */}
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="tree-node__children">
            {node.children.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelectFile={onSelectFile}
                depth={depth + 1}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}

        {/* If the folder is open but empty, say so */}
        {isExpanded && node.children && node.children.length === 0 && (
          <div
            className="tree-node__empty"
            style={{ paddingLeft: `${(depth + 1) * 20}px` }}
          >
            Empty folder
          </div>
        )}

      </div>
    )
  }


  // ── FILE ──────────────────────────────────────────────────────────────────
  if (node.type === 'file') {

    const extension = getExtension(node.name)
    const fileColour = getFileColour(extension)

    // If search is active and this file doesn't match, hide it.
    // Returning null tells React to render nothing for this node.
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null
    }

    const isSelected = node.id === selectedId

    return (
      <div
        className={`tree-node tree-node--file ${isSelected ? 'tree-node--selected' : ''}`}
        style={indentStyle}
        onClick={() => onSelectFile(node)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSelectFile(node)
        }}
      >
        {/* Spacer so the file icon lines up with folder icons */}
        <span style={{ width: '12px', flexShrink: 0 }} />

        <FileIcon colour={fileColour} />

        <span className="tree-node__name">{node.name}</span>

        {/* Size pushed to the far right */}
        <span className="tree-node__size">{node.size}</span>
      </div>
    )
  }

  return null
}

export default TreeNode
import './TreeNode.css'

// Pulling extension from the filename directly instead of
// adding an extra field to the JSON — keeps the data clean.
// Handles dotfiles like .gitignore too.
function getExtension(name) {
  if (name.startsWith('.') && name.lastIndexOf('.') === 0) {
    return name.slice(1).toLowerCase()
  }
  const parts = name.split('.')
  if (parts.length === 1) return ''
  return parts.pop().toLowerCase()
}

// Each extension maps to a colour from our design system.
// This drives the icon tint and the type label in the Properties panel.
function getFileColour(extension) {
  const map = {
    pdf:  'var(--danger)',
    docx: 'var(--accent)',
    doc:  'var(--accent)',
    png:  'var(--warning)',
    jpg:  'var(--warning)',
    svg:  'var(--warning)',
    xlsx: 'var(--success)',
    xls:  'var(--success)',
    txt:  'var(--text-muted)',
    yaml: 'var(--text-muted)',
    ttf:  'var(--text-muted)',
  }
  return map[extension] || 'var(--text-muted)'
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
// Built as inline SVGs — no icon library needed.
// The brief says no external component libraries, so I rolled my own.

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
        // Rotating is cheaper than swapping between two icons
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.15s ease',
        flexShrink: 0,
      }}
    >
      <polyline points="4,2 8,6 4,10" />
    </svg>
  )
}

// ─── HIGHLIGHT HELPER ─────────────────────────────────────────────────────────
// Wraps the matching part of a filename in a highlight span.
// Example: searching "pdf" in "report.pdf" highlights just "pdf" in orange.
// We split the name into three parts: before, match, after.

function HighlightedName({ name, searchQuery }) {
  if (!searchQuery) return <span>{name}</span>

  const lowerName = name.toLowerCase()
  const lowerQuery = searchQuery.toLowerCase()
  const matchIndex = lowerName.indexOf(lowerQuery)

  // If the query isn't in the name, just show the name normally
  if (matchIndex === -1) return <span>{name}</span>

  const before = name.slice(0, matchIndex)
  const match = name.slice(matchIndex, matchIndex + searchQuery.length)
  const after = name.slice(matchIndex + searchQuery.length)

  return (
    <span>
      {before}
      <span className="tree-node__highlight">{match}</span>
      {after}
    </span>
  )
}

// ─── TREE NODE ────────────────────────────────────────────────────────────────
// The core recursive component — the heart of the whole project.
//
// A TreeNode renders one node from the data.
// If that node is a folder, it renders its children as more TreeNodes.
// Those children do the same thing. That's the recursion.
// It doesn't matter if the tree is 2 levels deep or 20 — it just works.
//
// Props:
//   node           — the current node object from data.json
//   selectedId     — id of the selected file, lives in App state
//   focusedId      — id of the keyboard focused node, lives in App state
//   onSelectFile   — fires when a file is clicked, updates App state
//   depth          — tracks how deep we are, controls indentation
//   searchQuery    — current search string, used for highlight + auto-expand
//   expandedIds    — Set of folder ids that are open, lives in App state
//   setExpandedIds — updates which folders are open

function TreeNode({
  node,
  selectedId,
  focusedId,
  onSelectFile,
  depth = 0,
  searchQuery,
  expandedIds,
  setExpandedIds,
}) {

  // Every level of depth adds 20px of left padding.
  // This is how the visual hierarchy is created without any extra logic.
  const indentStyle = { paddingLeft: `${depth * 20}px` }

  // ── FOLDER ──────────────────────────────────────────────────────────────────
  if (node.type === 'folder') {

    // Check if this folder's id is in the expandedIds Set.
    // This replaced local isOpen state so the keyboard hook can control it.
    const isOpen = expandedIds.has(node.id)

    // For the search feature — check if any file inside this folder
    // matches the search query. If yes, force this folder open
    // so the matching file is visible.
    const hasMatchingDescendant = (n) => {
      if (!searchQuery) return false
      return n.children?.some(child => {
        if (child.type === 'file') {
          return child.name.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return hasMatchingDescendant(child)
      })
    }

    // Folder shows as open if manually clicked OR search found a match inside
    const isExpanded = isOpen || hasMatchingDescendant(node)

    // Toggle this folder open or closed
    const handleToggle = () => {
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

    const isFocused = node.id === focusedId

    return (
      <div className="tree-node-wrapper">

        {/* Clickable folder row */}
        <div
          className={`tree-node tree-node--folder ${isFocused ? 'tree-node--focused' : ''}`}
          style={indentStyle}
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleToggle()
          }}
        >
          <ChevronIcon isOpen={isExpanded} />
          <FolderIcon colour="#E3B341" />
          <span className="tree-node__name">{node.name}</span>
        </div>

        {/* Only render children when expanded.
            Each child is a new TreeNode — this is the recursion.
            depth + 1 increases the indent for the next level. */}
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="tree-node__children">
            {node.children.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                selectedId={selectedId}
                focusedId={focusedId}
                onSelectFile={onSelectFile}
                depth={depth + 1}
                searchQuery={searchQuery}
                expandedIds={expandedIds}
                setExpandedIds={setExpandedIds}
              />
            ))}
          </div>
        )}

        {/* If the folder is open but has no children, say so */}
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

  // ── FILE ────────────────────────────────────────────────────────────────────
  if (node.type === 'file') {

    const extension = getExtension(node.name)
    const fileColour = getFileColour(extension)

    // If search is active and this file doesn't match, hide it.
    // Returning null tells React to render nothing for this node.
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null
    }

    const isSelected = node.id === selectedId
    const isFocused = node.id === focusedId

    return (
      <div
        className={`tree-node tree-node--file ${isSelected ? 'tree-node--selected' : ''} ${isFocused ? 'tree-node--focused' : ''}`}
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

        {/* HighlightedName wraps the matching search text in orange */}
        <span className="tree-node__name">
          <HighlightedName name={node.name} searchQuery={searchQuery} />
        </span>

        {/* Size pushed to the far right */}
        <span className="tree-node__size">{node.size}</span>
      </div>
    )
  }

  return null
}

export default TreeNode
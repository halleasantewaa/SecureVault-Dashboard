import './TreeNode.css'

// Same helper functions as before
// If the filename starts with a dot (like .gitignore),
// it has no real extension — treat the whole name as the type.
// Otherwise pull the extension from after the last dot.
function getExtension(name) {
  if (name.startsWith('.') && name.lastIndexOf('.') === 0) {
    return name.slice(1).toLowerCase() // ".gitignore" → "gitignore"
  }
  const parts = name.split('.')
  if (parts.length === 1) return '' // no extension at all
  return parts.pop().toLowerCase()
}

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
// The big change here: isOpen is no longer local state.
// Instead, the component receives expandedIds (a Set of open folder ids)
// from App, and checks whether its own id is in that Set.
// This lets the keyboard hook control open/closed state from outside.
//
// New props:
//   expandedIds    — Set of folder ids that are currently open (lives in App)
//   setExpandedIds — function to update that Set (lives in App)
//   focusedId      — id of the keyboard-focused node (lives in App)

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

  const indentStyle = { paddingLeft: `${depth * 20}px` }

  // ── FOLDER ──────────────────────────────────────────────────────────────────
  if (node.type === 'folder') {

    // Check if this folder's id is in the expandedIds Set
    // This replaces the old local isOpen state
    const isOpen = expandedIds.has(node.id)

    // Same search auto-expand logic as before
    const hasMatchingDescendant = (n) => {
      if (!searchQuery) return false
      return n.children?.some(child => {
        if (child.type === 'file') {
          return child.name.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return hasMatchingDescendant(child)
      })
    }

    const isExpanded = isOpen || hasMatchingDescendant(node)

    // Toggle this folder's id in the expandedIds Set
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

    // Is this node currently focused by the keyboard?
    const isFocused = node.id === focusedId

    return (
      <div className="tree-node-wrapper">
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
          {/* If search is active, highlight the matching part of the filename.
    We split the name around the matching text and wrap the match
    in a highlight span. */}
<span className="tree-node__name">
  {searchQuery ? (() => {
    const lowerName = node.name.toLowerCase()
    const lowerQuery = searchQuery.toLowerCase()
    const matchIndex = lowerName.indexOf(lowerQuery)

    // If no match found, just show the name normally
    if (matchIndex === -1) return node.name

    // Split into three parts: before, match, after
    const before = node.name.slice(0, matchIndex)
    const match = node.name.slice(matchIndex, matchIndex + searchQuery.length)
    const after = node.name.slice(matchIndex + searchQuery.length)

    return (
      <>
        {before}
        <span className="tree-node__highlight">{match}</span>
        {after}
      </>
    )
  })() : node.name}
</span>
        </div>

        {/* Recursion — each child gets the same expandedIds and setExpandedIds */}
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
        <span style={{ width: '12px', flexShrink: 0 }} />
        <FileIcon colour={fileColour} />
        <span className="tree-node__name">{node.name}</span>
        <span className="tree-node__size">{node.size}</span>
      </div>
    )
  }

  return null
}

export default TreeNode
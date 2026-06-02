import './PropertiesPanel.css'

// Pulling extension from the filename directly instead of
// adding an extra field to the JSON — keeps the data clean.
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

// Bigger file icon for the top of the panel
function FilePanelIcon({ colour }) {
  return (
    <svg
      width="28"
      height="28"
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

// Keyboard hints — reused in both empty and selected states
// so the user always knows how to navigate
function KeyboardHints() {
  return (
    <div className="properties-panel__kbd-grid">
      <div className="properties-panel__kbd-row">
        <span className="kbd">↑</span>
        <span className="kbd">↓</span>
        <span className="kbd-label">Move focus</span>
      </div>
      <div className="properties-panel__kbd-row">
        <span className="kbd">→</span>
        <span className="kbd-label">Expand folder</span>
      </div>
      <div className="properties-panel__kbd-row">
        <span className="kbd">←</span>
        <span className="kbd-label">Collapse / go up</span>
      </div>
      <div className="properties-panel__kbd-row">
        <span className="kbd">↵</span>
        <span className="kbd-label">Select file</span>
      </div>
    </div>
  )
}

// PropertiesPanel receives the selected file and its breadcrumb path.
// If no file is selected, it shows an empty state with instructions.
// Props:
//   selectedFile — the full node object of the selected file, or null
//   breadcrumb   — array of names leading to the selected file

function PropertiesPanel({ selectedFile, breadcrumb }) {

  // ── EMPTY STATE ────────────────────────────────────────────────────────────
  // Shown when no file has been selected yet
  if (!selectedFile) {
    return (
      <div className="properties-panel properties-panel--empty">

        {/* Empty state icon */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>

        <p className="properties-panel__empty-text">
          Select a file to view its properties
        </p>

        {/* Keyboard hints in the empty state */}
        <div className="properties-panel__kbd-hints">
          <p className="properties-panel__kbd-title">Keyboard navigation</p>
          <KeyboardHints />
        </div>

      </div>
    )
  }

  // ── FILE SELECTED STATE ────────────────────────────────────────────────────
  const extension = getExtension(selectedFile.name)
  const fileColour = getFileColour(extension)

  return (
    <div className="properties-panel">

      {/* Panel heading — Inter Medium 16px */}
      <div className="properties-panel__heading">PROPERTIES</div>

      {/* File icon + name */}
      <div className="properties-panel__file-row">
        <div
          className="properties-panel__file-icon"
          style={{ background: `${fileColour}18` }}
        >
          <FilePanelIcon colour={fileColour} />
        </div>
        <span className="properties-panel__file-name">{selectedFile.name}</span>
      </div>

      {/* Metadata rows */}
      <div className="properties-panel__meta">

        <div className="properties-panel__row">
          <span className="properties-panel__key">Type</span>
          <span
            className="properties-panel__val"
            style={{ color: fileColour }}
          >
            {extension.toUpperCase()}
          </span>
        </div>

        <div className="properties-panel__row">
          <span className="properties-panel__key">Size</span>
          <span className="properties-panel__val">{selectedFile.size}</span>
        </div>

        <div className="properties-panel__row properties-panel__row--location">
          <span className="properties-panel__key">Location</span>
          <span className="properties-panel__val properties-panel__val--location">
            {breadcrumb.join(' / ')}
          </span>
        </div>

      </div>

      {/* Keyboard hints stay visible when a file is selected.
          The user can always see how to navigate without mousing around. */}
      <div className="properties-panel__kbd-hints properties-panel__kbd-hints--bottom">
        <p className="properties-panel__kbd-title">Keyboard navigation</p>
        <KeyboardHints />
      </div>

    </div>
  )
}

export default PropertiesPanel
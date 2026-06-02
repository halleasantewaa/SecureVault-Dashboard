import './PropertiesPanel.css'

// I'm reusing the same getExtension and getFileColour logic from TreeNode.
// In a bigger project I'd move these to a shared utils file,
// but for this project keeping it simple is fine.
function getExtension(name) {
  return name.split('.').pop().toLowerCase()
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

// A small icon for the file — same as in TreeNode but bigger,
// since it's displayed prominently at the top of the panel.
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

// PropertiesPanel receives the selected file node and its breadcrumb path.
// If no file is selected, it shows an empty state with instructions.
// Props:
//   selectedFile  — the full node object of the selected file, or null
//   breadcrumb    — array of folder/file names leading to the selected file

function PropertiesPanel({ selectedFile, breadcrumb }) {

  // ── EMPTY STATE ────────────────────────────────────────────────────────────
  // Shown when no file has been selected yet.
  // Also shows the keyboard shortcuts so users know how to navigate.
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

        {/* Keyboard navigation hints — Inter Regular 14px as per design system */}
        <div className="properties-panel__kbd-hints">
          <p className="properties-panel__kbd-title">Keyboard navigation</p>
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
        </div>

      </div>
    )
  }

  // ── FILE SELECTED STATE ────────────────────────────────────────────────────
  const extension = getExtension(selectedFile.name)
  const fileColour = getFileColour(extension)

  return (
    <div className="properties-panel">

      {/* Panel heading — Inter Medium 16px as per design system */}
      <div className="properties-panel__heading">PROPERTIES</div>

      {/* File icon + name at the top */}
      <div className="properties-panel__file-row">
        <div
          className="properties-panel__file-icon"
          style={{ background: `${fileColour}18` }}
        >
          <FilePanelIcon colour={fileColour} />
        </div>
        <span className="properties-panel__file-name">{selectedFile.name}</span>
      </div>

      {/* Metadata rows — Name, Type, Size, Location */}
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

        {/* Breadcrumb path — this is the wildcard feature.
            It shows the full path to the file so the user always
            knows exactly where they are in the vault. */}
        <div className="properties-panel__row properties-panel__row--location">
          <span className="properties-panel__key">Location</span>
          <span className="properties-panel__val properties-panel__val--location">
            {breadcrumb.join(' / ')}
          </span>
        </div>

      </div>

    </div>
  )
}

export default PropertiesPanel
import './SearchBar.css'

// SearchBar is a controlled input — meaning React controls its value,
// not the browser. Every time the user types, onSearch fires and
// updates the searchQuery state in App, which flows back down as `value`.
// This is the standard React way of handling inputs.

function SearchBar({ value, onSearch }) {
  return (
    <div className="search-bar">

      {/* Search icon on the left */}
      <svg
        className="search-bar__icon"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        className="search-bar__input"
        type="text"
        placeholder="Search files and folders..."
        value={value}
        // Every keystroke calls onSearch with the new value.
        // This updates searchQuery in App, which re-renders the tree
        // showing only matching files with their parent folders expanded.
        onChange={(e) => onSearch(e.target.value)}
      />

      {/* Clear button — only shows when there's something typed */}
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onSearch('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}

    </div>
  )
}

export default SearchBar
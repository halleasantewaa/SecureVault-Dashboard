import SearchBar from './SearchBar'
import './AppHeader.css'

// AppHeader sits at the very top of the app.
// It holds the logo on the left and the search bar on the right.
// It doesn't manage any state itself — it just receives searchQuery
// and onSearch from App and passes them down to SearchBar.

function AppHeader({ searchQuery, onSearch }) {
  return (
    <header className="app-header">

      {/* Left side — logo + app name */}
      <div className="app-header__logo">

        {/* Lock icon — built as an inline SVG, no library needed */}
        <div className="app-header__logo-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <span className="app-header__logo-name">SecureVault</span>
      </div>

      {/* Right side — search bar.
          The value and handler come from App state,
          passed through here into SearchBar. */}
      <SearchBar value={searchQuery} onSearch={onSearch} />

    </header>
  )
}

export default AppHeader
# SecureVault Dashboard

A high-performance file explorer UI built for SecureVault Inc. — an enterprise cloud storage platform serving law firms and banks. Built with React, designed from scratch with a custom dark-mode design system.

**Live Demo:** https://secure-vault-dashboard-psi.vercel.app

**Design File:** https://www.figma.com/design/g0XFO9Vo4E7agZZ04SNAFp/SecureVault-Challenge---Halle?node-id=45-32&t=Gpk6fNKuU7HapRlz-1

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Installation

Clone the repository:

```bash
git clone [your repo link here]
cd securevault-dashboard
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
```

---

## Design System

The UI is built on a custom dark-mode design system defined in `src/index.css`. All values are exposed as CSS custom properties (variables) so every component references the same tokens consistently.

| Token           | Value     | Usage                       |
| --------------- | --------- | --------------------------- |
| `--bg-base`     | `#0D1117` | App background              |
| `--bg-surface`  | `#161B22` | Sidebar, panels             |
| `--bg-elevated` | `#1C2128` | Hover states                |
| `--bg-selected` | `#1C2D45` | Selected file row           |
| `--accent`      | `#2F81F7` | Focus, selection, CTA       |
| `--danger`      | `#F85149` | PDF files, errors           |
| `--success`     | `#3FB950` | Confirmations               |
| `--warning`     | `#FFD700` | PNG files, search highlight |

**Typography:** Inter across the entire interface — controlled through weight and size rather than multiple typefaces.

**Spacing:** Base unit of 4px. All spacing values are exact multiples: 4, 8, 12, 16, 24, 32, 48px.

---

## Recursive Strategy

The file explorer is built around a single recursive component — `TreeNode`.

The core insight is that a folder and a file are the same component with different behaviour. `TreeNode` receives one node from `data.json` and decides how to render it:

- If the node is a **folder** — it renders a clickable row, then maps over `node.children` and renders a `TreeNode` for each child. Those children do the same thing. This is the recursion.
- If the node is a **file** — it renders a leaf row with no children. The recursion stops here.
  TreeNode (folder)

  └── TreeNode (folder)

  └── TreeNode (file) ← recursion stops
  
  └── TreeNode (file) ← recursion stops

The component does not need to know how deep it is in the tree. React handles the call stack. This means the component handles 2 levels of depth or 20 levels with identical code.

**State management:** All shared state lives in `App.jsx` as a single source of truth:

| State          | Type            | Purpose                      |
| -------------- | --------------- | ---------------------------- |
| `selectedFile` | `object / null` | Currently selected file node |
| `searchQuery`  | `string`        | Current search string        |
| `expandedIds`  | `Set<string>`   | Folder IDs that are open     |
| `focusedId`    | `string / null` | Keyboard focused node ID     |

`expandedIds` uses a JavaScript `Set` because checking membership is O(1) — every render checks whether a folder is open, so this needs to be fast.

---

## Wildcard Feature — Breadcrumb Trail

**The gap I identified:** When navigating deeply nested folders, users lose track of where they are. A lawyer working 5 levels deep in `01_Legal_Department / Active_Cases / Doe_vs_MegaCorp_Inc / Discovery_Phase` has no spatial context without a breadcrumb.

**What I built:** A clickable breadcrumb trail that appears above the Properties panel whenever a file is selected. It shows the full path from the vault root to the selected file. Every folder segment is clickable — clicking it collapses the tree back to that folder level and clears the selection.

**Business value:** Law firms navigate by case hierarchy. The breadcrumb maps directly to how lawyers think about their files — by matter, then sub-matter, then document. It reduces the cognitive load of deep navigation and makes the vault feel like a structured workspace rather than a flat list.

**How it works technically:** A `findPath` function recursively walks the data tree from the root, tracking the path as an array of names. When it finds the target node by ID, it returns the accumulated path. This is the same recursive traversal pattern used in the tree component itself.

---

## Bonus Feature — Search & Filter

A search bar filters the entire tree in real time. Matching items deep inside folders force their parent folders to expand automatically so results are always visible.

**Highlight:** The matching portion of each filename and folder name is highlighted in gold so users can immediately see why a result appeared.

**How the auto-expand works:** Each `TreeNode` folder checks whether any of its descendants match the search query using a recursive `hasMatchingDescendant` function. If a match exists anywhere inside the folder, the folder renders as expanded regardless of its manual open/closed state.

---

## Component Architecture

App
├── AppHeader — logo + search bar

├── TreeView — maps root data array, passes state down

│ └── TreeNode — recursive, renders folders and files

└── PropertiesPanel — selected file metadata + keyboard hints

**Custom hook:** `useKeyboardNavigation` (in `src/hooks/`) handles all keyboard events. It maintains a flat list of visible nodes and moves focus through them on arrow key presses.

---

## Tech Stack

- **React** — component-based UI
- **Vite** — build tool and dev server
- **CSS custom properties** — design token system
- **No component libraries** — every component built from scratch

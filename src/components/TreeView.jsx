import TreeNode from './TreeNode'
import './TreeView.css'

// TreeView is the container for the entire file tree.
// It takes the raw data array and renders a TreeNode for each root-level item.
// Root-level items can be folders OR files (like README.txt and .gitignore in our data).

function TreeView({ data, selectedId, onSelectFile, searchQuery }) {
  return (
    <div className="tree-view">

      {/* Map over the root array from data.json.
          Each item gets its own TreeNode starting at depth 0.
          The TreeNode handles everything from here — folders, files, nesting. */}
      {data.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelectFile={onSelectFile}
          depth={0}
          searchQuery={searchQuery}
        />
      ))}

    </div>
  )
}

export default TreeView
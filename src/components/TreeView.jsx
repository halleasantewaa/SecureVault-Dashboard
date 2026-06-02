import TreeNode from './TreeNode'
import './TreeView.css'

// TreeView now passes expandedIds, setExpandedIds, and focusedId
// down to each TreeNode. These all live in App — TreeView is just
// the middleman passing them through to where they're needed.

function TreeView({
  data,
  selectedId,
  focusedId,
  onSelectFile,
  searchQuery,
  expandedIds,
  setExpandedIds,
}) {
  return (
    <div className="tree-view">
      {data.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          focusedId={focusedId}
          onSelectFile={onSelectFile}
          depth={0}
          searchQuery={searchQuery}
          expandedIds={expandedIds}
          setExpandedIds={setExpandedIds}
        />
      ))}
    </div>
  )
}

export default TreeView
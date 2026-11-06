export default function DataTable({ columns = [], data = [], onRowClick }) {
  if (!data.length) return null
  return (
    <div className="overflow-x-auto rounded-xl border border-warm-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ivory">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-heading font-semibold text-charcoal text-xs uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-border">
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={`bg-white hover:bg-ivory/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-charcoal">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

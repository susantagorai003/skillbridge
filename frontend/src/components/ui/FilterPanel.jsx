export default function FilterPanel({ filters = [], values = {}, onChange }) {
  return (
    <div className="bg-white rounded-xl border border-warm-border p-4 space-y-4">
      <h4 className="font-heading font-semibold text-sm text-charcoal">Filters</h4>
      {filters.map((filter) => (
        <div key={filter.key}>
          <label className="block text-xs font-medium text-sage-dark mb-1">{filter.label}</label>
          {filter.type === 'select' ? (
            <select
              value={values[filter.key] || ''}
              onChange={(e) => onChange({ ...values, [filter.key]: e.target.value })}
              className="w-full px-3 py-2 bg-ivory border border-warm-border rounded-lg text-sm focus:outline-none focus:border-sage"
            >
              <option value="">All</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={filter.type || 'text'}
              value={values[filter.key] || ''}
              onChange={(e) => onChange({ ...values, [filter.key]: e.target.value })}
              placeholder={filter.placeholder}
              className="w-full px-3 py-2 bg-ivory border border-warm-border rounded-lg text-sm focus:outline-none focus:border-sage"
            />
          )}
        </div>
      ))}
    </div>
  )
}

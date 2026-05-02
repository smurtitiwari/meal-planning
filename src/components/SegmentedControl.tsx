type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  darkMode?: boolean
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  darkMode = false,
}: SegmentedControlProps<T>) {
  const rail   = darkMode ? '#1B1B1B' : '#E8E3DD'
  const active = darkMode ? '#2A2A2A' : '#F7F4EF'
  const activeShadow = darkMode
    ? '0 1px 4px rgba(0,0,0,0.4)'
    : '0 1px 4px rgba(28,27,31,0.08)'
  const activeText   = darkMode ? '#FEFEFE' : '#1C1B1F'
  const inactiveText = darkMode ? '#6B6370' : '#6F6B73'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        background: rail,
        borderRadius: 12,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              background: selected ? active : 'transparent',
              color: selected ? activeText : inactiveText,
              fontSize: '14px',
              fontWeight: selected ? 700 : 500,
              padding: '9px 0',
              borderRadius: 10,
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: selected ? activeShadow : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

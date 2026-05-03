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
  const rail         = darkMode ? '#1B1B1B' : '#EDE9E4'
  const active       = darkMode ? '#2A2A2A' : '#FFFFFF'
  const activeShadow = darkMode ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(28,27,31,0.07)'
  const activeText   = darkMode ? '#FEFEFE' : '#1C1C1C'
  const inactiveText = darkMode ? '#6B6370' : '#6F6B66'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        background: rail,
        borderRadius: 12,
        padding: 2,
        gap: 2,
        height: 40,
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
              height: 36,
              padding: '0',
              borderRadius: 10,
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease, font-weight 0.1s ease',
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

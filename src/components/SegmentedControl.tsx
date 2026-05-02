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
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              flex: 1,
              background: selected
                ? (darkMode ? '#121212' : '#F7F4EF')
                : (darkMode ? '#0D0D0D' : '#E4DFD9'),
              color: selected
                ? (darkMode ? '#FEFEFE' : '#1C1B1F')
                : (darkMode ? '#5A5460' : '#7A746D'),
              fontSize: '14px',
              fontWeight: selected ? 700 : 500,
              padding: '10px 0',
              borderRadius: '10px 10px 0 0',
              border: selected
                ? `1px solid ${darkMode ? '#2E2E2E' : '#E6E0D8'}`
                : '1px solid transparent',
              borderBottom: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
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

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
  // Selected tab = main page background; inactive = slightly darker muted tone
  const activeTab    = darkMode ? '#121212' : '#F7F4EF'
  const inactiveTab  = darkMode ? '#0D0D0D' : '#E4DFD9'
  const activeText   = darkMode ? '#FEFEFE' : '#1C1B1F'
  const inactiveText = darkMode ? '#5A5460' : '#7A746D'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 3,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              flex: 1,
              background: selected ? activeTab : inactiveTab,
              color: selected ? activeText : inactiveText,
              fontSize: '14px',
              fontWeight: selected ? 700 : 500,
              paddingTop: selected ? 10 : 8,
              paddingBottom: selected ? 10 : 8,
              paddingLeft: 0,
              paddingRight: 0,
              borderRadius: '10px 10px 0 0',
              border: 'none',
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

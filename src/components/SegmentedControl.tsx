type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  railBackground: string
  activeBackground: string
  activeText: string
  inactiveText: string
  activeBorder?: string
  inactiveBorder?: string
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  railBackground,
  activeBackground,
  activeText,
  inactiveText,
  activeBorder,
  inactiveBorder,
}: SegmentedControlProps<T>) {
  const count = Math.max(options.length, 1)

  return (
    <div className="relative w-full" style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="cursor-pointer transition-smooth whitespace-nowrap"
            style={{
              background: selected ? activeBackground : railBackground,
              color: selected ? activeText : inactiveText,
              fontSize: '15px',
              fontWeight: selected ? 700 : 600,
              padding: '14px 0',
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              border: selected
                ? (activeBorder ? `1px solid ${activeBorder}` : '1px solid transparent')
                : (inactiveBorder ? `1px solid ${inactiveBorder}` : '1px solid transparent'),
              borderBottom: 'none',
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

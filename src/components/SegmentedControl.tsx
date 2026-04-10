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
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const gap = 4
  const padding = 4
  const count = Math.max(options.length, 1)
  const trackWidth = `calc((100% - ${padding * 2}px - ${(count - 1) * gap}px) / ${count})`
  const trackLeft = `calc(${padding}px + ${activeIndex} * (${trackWidth} + ${gap}px))`

  return (
    <div
      className="relative w-full rounded-xl p-1"
      style={{ background: railBackground }}
    >
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-lg transition-smooth"
        style={{
          left: trackLeft,
          width: trackWidth,
          background: activeBackground,
          border: activeBorder ? `1px solid ${activeBorder}` : 'none',
          boxShadow: activeBackground === '#FFFFFF' || activeBackground === '#2E2E2E' ? '0px 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
        }}
      />
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`, gap }}>
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className="py-2.5 rounded-lg border-none bg-transparent cursor-pointer transition-smooth whitespace-nowrap"
              style={{
                color: selected ? activeText : inactiveText,
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: 'none',
                outline: 'none',
                border: inactiveBorder && !selected ? `1px solid ${inactiveBorder}` : '1px solid transparent',
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

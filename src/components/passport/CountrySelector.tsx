import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { PASSPORT_SPECS, type PassportSpec } from '@/lib/passport-specs'
import { cn } from '@/lib/utils'

interface CountrySelectorProps {
  selectedSpec: PassportSpec
  onSelectSpec: (spec: PassportSpec) => void
}

export function CountrySelector({ selectedSpec, onSelectSpec }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredSpecs = PASSPORT_SPECS.filter(spec =>
    spec.country.toLowerCase().includes(search.toLowerCase()) ||
    spec.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-colors",
          "bg-card hover:bg-accent/50 border-border",
          isOpen && "ring-2 ring-primary"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedSpec.flag}</span>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{selectedSpec.country}</p>
            <p className="text-xs text-muted-foreground">{selectedSpec.name}</p>
          </div>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search country or document..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredSpecs.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No results found
                </div>
              ) : (
                filteredSpecs.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => {
                      onSelectSpec(spec)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      "hover:bg-accent/50",
                      selectedSpec.id === spec.id && "bg-accent"
                    )}
                  >
                    <span className="text-xl">{spec.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {spec.country}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {spec.name} • {spec.width}x{spec.height}mm
                      </p>
                    </div>
                    {selectedSpec.id === spec.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

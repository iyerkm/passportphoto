import { Check, Info, ExternalLink, FileText } from 'lucide-react'
import { type PassportSpec } from '@/lib/passport-specs'
import { cn } from '@/lib/utils'

interface PassportSpecsProps {
  spec: PassportSpec
  className?: string
}

export function PassportSpecs({ spec, className }: PassportSpecsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{spec.name} Requirements</h3>
      </div>

      {/* Dimensions */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-3">Specifications</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Print Size</p>
            <p className="text-sm font-medium">{spec.width} x {spec.height} mm</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Digital Size</p>
            <p className="text-sm font-medium">{spec.digitalWidth} x {spec.digitalHeight} px</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">File Size</p>
            <p className="text-sm font-medium">{spec.fileSizeMinKB} - {spec.fileSizeMaxKB} KB</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Background</p>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: spec.backgroundColor }}
              />
              <p className="text-sm font-medium">{spec.backgroundColorName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Requirements</h4>
        {spec.requirements.map((req, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{req}</span>
          </div>
        ))}
      </div>

      {/* Official Requirements Link */}
      {spec.officialUrl && (
        <div className="pt-2 border-t border-border">
          <a
            href={spec.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <FileText className="w-4 h-4" />
            View Official Requirements
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}

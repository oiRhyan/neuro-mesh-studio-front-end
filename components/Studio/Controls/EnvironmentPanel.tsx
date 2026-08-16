'use client'

import {
  Sun,
  Aperture
} from 'lucide-react'

export function EnvironmentPanel() {
  return (
    <div className="environment-panel">

      <h3>Ambiente</h3>

      <div className="control-group">
        <div className="control-label">
          <Sun size={18} />
          Luz
        </div>

        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          defaultValue="2"
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <Aperture size={18} />
          Exposição
        </div>

        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          defaultValue="1"
        />
      </div>

    </div>
  )
}
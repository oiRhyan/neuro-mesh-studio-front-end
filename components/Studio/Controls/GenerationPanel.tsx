'use client'

import { Upload, Sparkles } from 'lucide-react'

export function GenerationPanel() {
  return (
    <div className="generation-panel">

      <h3>Gerar Modelo</h3>

      <label className="upload-area">
        <Upload size={28} />

        <span>
          Clique para anexar imagem
        </span>

        <input
          type="file"
          accept="image/*"
          hidden
        />
      </label>

      <button className="generate-button">
        <Sparkles size={18} />
        Gerar Modelo 3D
      </button>

    </div>
  )
}
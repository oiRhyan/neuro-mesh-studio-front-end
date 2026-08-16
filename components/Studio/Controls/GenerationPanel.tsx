'use client'

import { Button } from '@/components/ui/button';
import { Upload, Sparkles } from 'lucide-react'
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

type Props = {
  onGenerate: (image: File) => void,
  loading: boolean
}

export function GenerationPanel({ onGenerate, loading }: Props) {

  const [image, setImage] = useState<File | null>(null);

  return (
    <div className="generation-panel">
      <h3>Gerar Modelo</h3>
      <label className="upload-area">
        {image ? (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="upload-preview"
          />
        ) : (
          <>
            <Upload size={28} />
            <span>
              Clique para anexar imagem
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setImage(e.target.files[0]);
            }
          }}
          hidden
        />
      </label>
      <Button
        className="generate-button"
        disabled={loading}
        onClick={() => { if (image != null) onGenerate(image) }}
      >
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Gerando modelo aguarde
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Gerar Modelo 3D
          </>
        )
        }
      </Button>

    </div>
  )
}
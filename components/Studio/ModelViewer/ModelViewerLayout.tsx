'use client'

import { EnvironmentPanel } from '../Controls/EnvironmentPanel'
import { GenerationPanel } from '../Controls/GenerationPanel'
import { ModelList } from '../ModelList'
import { LoadingModel } from './LoadingModel/LoadingModel'
import { ModelToolbar } from './ModelToolbar'
import { ViewerCanvas } from './ViewerCanvas'
import { ViewerTopbar } from './ViewTopBar'
import { useState } from 'react'

interface ModelViewerLayoutProps {
  modelUrl?: string
  modelThumbnail?: string
  onGenerate: (image: File) => void
  loading: boolean
  progress: number
  onSelectModel: (url: string) => void
}

export function ModelViewerLayout({
  modelUrl,
  modelThumbnail,
  onGenerate,
  loading,
  progress,
  onSelectModel
}: ModelViewerLayoutProps) {
  
  const [modelId, setModelId] = useState<string>('');

  return (
    <section className="viewer-layout">
      <div className="viewer-container">
        <ViewerTopbar />

        <ViewerCanvas modelUrl={modelUrl} />

        <div className="left-panel">
          <ModelList onSelectModel={onSelectModel} onSelectModelId={setModelId} />
          <GenerationPanel onGenerate={onGenerate} loading={loading} />
        </div>

        <LoadingModel progress={progress} loading={loading} />

        <EnvironmentPanel />

        <ModelToolbar modelUrl={modelUrl ?? ""} modelThumbnail={modelThumbnail ?? ""} modelId={modelId} />
      </div>
    </section>
  )
}
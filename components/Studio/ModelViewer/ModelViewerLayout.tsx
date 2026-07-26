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

  const handleGenerate = (image: File) => {
    setModelId(''); 
    onGenerate(image);
  };

  const handleSelectModelFromList = (url: string, id: string) => {
    setModelId(id);
    onSelectModel(url);
  };

  return (
    <section className="viewer-layout">
      <div className="viewer-container">
        <ViewerTopbar />
        <ViewerCanvas modelUrl={modelUrl} />
        <div className="left-panel">
          <ModelList 
            onSelectModel={(url) => onSelectModel(url)} 
            onSelectModelId={(id) => setModelId(id)} 
          />
          <GenerationPanel onGenerate={handleGenerate} loading={loading} />
        </div>
        <LoadingModel progress={progress} loading={loading} />
        <EnvironmentPanel />
        <ModelToolbar 
          modelUrl={modelUrl ?? ""} 
          modelThumbnail={modelThumbnail ?? ""} 
          modelId={modelId} 
          onModelSaved={(newId) => setModelId(newId)}
        />
      </div>
    </section>
  )
}
'use client'

import { EnvironmentPanel } from '../Controls/EnvironmentPanel'
import { GenerationPanel } from '../Controls/GenerationPanel'
import { ModelList } from '../ModelList'
import { LoadingModel } from './LoadingModel/LoadingModel'
import { ModelToolbar } from './ModelToolbar'
import { ViewerCanvas } from './ViewerCanvas'
import { useState, useEffect } from 'react'
import { GenerationStep } from '@/hooks/useGenerateModel'

interface ModelViewerLayoutProps {
  modelUrl?: string
  modelId?: string
  modelThumbnail?: string
  onGenerate: (image: File) => void
  loading: boolean
  progress: number
  step: GenerationStep
  onSelectModel: (url: string, id?: string) => void
}

export function ModelViewerLayout({
  modelUrl,
  modelId: initialModelId = '',
  modelThumbnail,
  onGenerate,
  loading,
  progress,
  step,
  onSelectModel
}: ModelViewerLayoutProps) {
  
  const [modelId, setModelId] = useState<string>(initialModelId);

  useEffect(() => {
    if (initialModelId) {
      setModelId(initialModelId);
    }
  }, [initialModelId]);

  const handleGenerate = (image: File) => {
    setModelId(''); 
    onSelectModel('', '');
    onGenerate(image);
  };

  const handleSelectModelFromList = (url: string, id: string) => {
    setModelId(id);
    onSelectModel(url, id);
  };

  return (
    <section className="viewer-layout">
      <div className="viewer-container">
        <ViewerCanvas modelUrl={modelUrl} />
        <div className="left-panel">
          <ModelList 
            onSelectModel={handleSelectModelFromList} 
          />
          <GenerationPanel onGenerate={handleGenerate} loading={loading} />
        </div>
        <LoadingModel progress={progress} loading={loading} step={step} />
        <EnvironmentPanel />
        <ModelToolbar 
          modelUrl={modelUrl ?? ""} 
          modelThumbnail={modelThumbnail ?? ""} 
          modelId={modelId} 
          onModelSaved={(newId) => {
            setModelId(newId);
            if (modelUrl) onSelectModel(modelUrl, newId);
          }}
        />
      </div>
    </section>
  )
}
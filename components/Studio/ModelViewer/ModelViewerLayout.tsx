'use client'

import { EnvironmentPanel } from '../Controls/EnvironmentPanel'
import { GenerationPanel } from '../Controls/GenerationPanel'
import { ModelList } from '../ModelList'
import { LoadingModel } from './LoadingModel/LoadingModel'
import { ModelToolbar } from './ModelToolbar'
import { ViewerCanvas } from './ViewerCanvas'
import { ViewerTopbar } from './ViewTopBar'
import { useState } from 'react'
import { GenerationStep } from '@/hooks/useGenerateModel'

interface ModelViewerLayoutProps {
  modelUrl?: string
  modelThumbnail?: string
  onGenerate: (image: File) => void
  loading: boolean
  progress: number
  step: GenerationStep
  onSelectModel: (url: string) => void
}

export function ModelViewerLayout({
  modelUrl,
  modelThumbnail,
  onGenerate,
  loading,
  progress,
  step,
  onSelectModel
}: ModelViewerLayoutProps) {
  
  const [modelId, setModelId] = useState<string>('');
  
  // Estado para controlar se a animação Taunt está ativa ou não
  const [isTaunting, setIsTaunting] = useState<boolean>(false);

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
            onSelectModel={(url) => handleSelectModelFromList(url, modelId)} 
            onSelectModelId={(id) => setModelId(id)} 
          />
          <GenerationPanel onGenerate={handleGenerate} loading={loading} />
        </div>
        
        <LoadingModel progress={progress} loading={loading} step={step} />
        
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
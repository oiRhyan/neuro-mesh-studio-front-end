'use client'

import { useGenerateModel } from '@/hooks/useGenerateModel';
import '../../../components/Studio/studio.scss'
import { ModelViewerLayout } from "@/components/Studio/ModelViewer/ModelViewerLayout"
import { useState, useEffect } from 'react';

export default function Studio() {
  const {
    generate,
    loading,
    progress,
    step,
    modelUrl: generatedModelUrl 
  } = useGenerateModel();

  const [activeModelUrl, setActiveModelUrl] = useState<string | undefined>();

  useEffect(() => {
    if (generatedModelUrl) {
      setActiveModelUrl(generatedModelUrl);
    }
  }, [generatedModelUrl]);

  useEffect(() => {
    if (activeModelUrl) {
      localStorage.setItem('@neuro-mesh:last-model-url', activeModelUrl);
    }
  }, [activeModelUrl]);

  return (
    <main className="studio-page">
      <ModelViewerLayout
        modelUrl={activeModelUrl}
        onSelectModel={setActiveModelUrl}
        onGenerate={generate}
        loading={loading}
        progress={progress}
        step={step}
      />
    </main>
  )
}
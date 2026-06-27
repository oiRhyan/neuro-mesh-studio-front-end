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
    modelUrl: generatedModelUrl 
  } = useGenerateModel();

  const [activeModelUrl, setActiveModelUrl] = useState<string | undefined>();

  useEffect(() => {
    if (generatedModelUrl) {
      setActiveModelUrl(generatedModelUrl);
    }
  }, [generatedModelUrl]);

  return (
    <main className="studio-page">
      <ModelViewerLayout
        modelUrl={activeModelUrl}
        onSelectModel={setActiveModelUrl}
        onGenerate={generate}
        loading={loading}
        progress={progress}
      />
    </main>
  )
}
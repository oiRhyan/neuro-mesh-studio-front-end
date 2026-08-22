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
  const [activeModelId, setActiveModelId] = useState<string>('');

  useEffect(() => {
    const cachedUrl = localStorage.getItem('@neuro-mesh:last-model-url');
    const cachedId = localStorage.getItem('@neuro-mesh:last-model-id');

    if (cachedUrl) setActiveModelUrl(cachedUrl);
    if (cachedId) setActiveModelId(cachedId);
  }, []);

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

  useEffect(() => {
    if (activeModelId) {
      localStorage.setItem('@neuro-mesh:last-model-id', activeModelId);
    } else {
      localStorage.removeItem('@neuro-mesh:last-model-id');
    }
  }, [activeModelId]);

  return (
    <main className="studio-page">
      <ModelViewerLayout
        modelUrl={activeModelUrl}
        modelId={activeModelId}
        onSelectModel={(url, id) => {
          setActiveModelUrl(url);
          if (id !== undefined) setActiveModelId(id);
        }}
        onGenerate={generate}
        loading={loading}
        progress={progress}
        step={step}
      />
    </main>
  )
}
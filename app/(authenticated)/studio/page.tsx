'use client'

import { useGenerateModel } from '@/hooks/useGenerateModel';
import '../../../components/Studio/studio.scss'
import { ModelViewerLayout } from "@/components/Studio/ModelViewer/ModelViewerLayout"
import { useState, useEffect } from 'react'; // ➡️ 1. Importe o useEffect

export default function Studio() {
  // Renomeei para 'generatedModelUrl' para ficar mais claro o que veio do hook
  const {
    generate,
    loading,
    progress,
    modelUrl: generatedModelUrl 
  } = useGenerateModel();

  const [activeModelUrl, setActiveModelUrl] = useState<string | undefined>();

  // ➡️ 2. Efeito colateral: Sempre que a IA terminar de gerar um modelo novo,
  // nós definimos ele automaticamente como o modelo ativo na tela!
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
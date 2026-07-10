'use client';

import React, { Suspense, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, Html } from '@react-three/drei';
import { Loader2, Download, X } from 'lucide-react';

const ModelRenderer = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const CanvasLoader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[160px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
        <span className="text-xs font-medium tracking-wide text-zinc-300">Carregando modelo 3D</span>
      </div>
    </Html>
  );
};

interface ModelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: {
    modelTitle: string;
    modelDescription: string;
    pbrModel: string;
    modelThumbnail: string;
    user: {
      userName: string;
      profileImage: string;
      bannerImage: string;
      biography: string;
    };
  } | null;
}

export function ModelDetailsModal({ isOpen, onClose, model }: ModelDetailsModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!model) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(model.pbrModel);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${model.modelTitle.trim().replace(/\s+/g, '_')}.glb`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Falha ao efetuar download do asset:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl lg:max-w-6xl w-[94vw] p-0 bg-[#121212] border border-white/10 rounded-[28px] overflow-hidden gap-0 shadow-2xl transition-all text-white dialog-blur">
        <div className="sr-only">
          <DialogTitle>{model.modelTitle}</DialogTitle>
          <DialogDescription>{model.modelDescription}</DialogDescription>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] min-h-[580px] md:h-[620px] p-3 gap-4 relative">
          <div className="bg-[#16161a] border border-white/5 rounded-[20px] relative overflow-hidden flex flex-col h-[380px] md:h-full min-h-[340px]">
            <Canvas camera={{ position: [0, 1.2, 3.5], fov: 45 }}>
              <ambientLight intensity={1.8} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <directionalLight position={[-5, 5, -5]} intensity={0.8} />
              <Suspense fallback={<CanvasLoader />}>
                <Center>
                  <ModelRenderer url={model.pbrModel} />
                </Center>
              </Suspense>
              <OrbitControls makeDefault enableDamping minDistance={1} maxDistance={15} />
            </Canvas>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.015]">
              <span className="text-white text-6xl font-black tracking-widest uppercase fontfamily">NEURO MESH</span>
            </div>
          </div>

          <div className="flex flex-col relative px-2 pb-2 pt-1 justify-between gap-6">
            <div className="flex flex-col">
              <div className="h-[120px] w-full rounded-[16px] overflow-hidden bg-zinc-800 relative border border-white/5 shadow-inner">
                {model.user.bannerImage ? (
                  <img src={model.user.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-950/20 via-zinc-900 to-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 tracking-widest fontfamily">
                  </div>
                )}
              </div>

              <div className="flex flex-row items-end gap-3 px-3 -mt-9 relative z-20">
                <div className="w-[76px] h-[76px] rounded-full border-[4px] border-[#121212] bg-zinc-800 overflow-hidden shadow-xl shrink-0">
                  <img src={model.user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="pb-1 overflow-hidden">
                  <h3 className="text-white font-bold text-base leading-tight truncate fontfamily">@{model.user.userName}</h3>
                  <p className="text-zinc-400 text-xs truncate max-w-[240px] fontfamily">
                    {model.user.biography || "Criador de Malhas 3D"}
                  </p>
                </div>
              </div>

              <div className="mt-8 px-1">
                 <span className="text-purple-400 font-bold text-[10px] tracking-widest uppercase block mb-1.5 fontfamily">
                    Descrição do Modelo
                 </span>
                 <h2 className="text-white font-black text-2xl mb-3 leading-snug tracking-tight fontfamily">
                    {model.modelTitle}
                 </h2>
                 <div className="max-h-[180px] md:max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    <p className="text-zinc-300 text-sm font-normal leading-relaxed whitespace-pre-line fontfamily">
                       {model.modelDescription || "Este modelo foi renderizado e disponibilizado de forma pública na plataforma NeuroMesh."}
                    </p>
                 </div>
              </div>
            </div>
            <div className="px-1 w-full mt-auto">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold tracking-wide py-4 px-6 rounded-[16px] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-purple-900/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none fontfamily"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>PROCESSANDO DOWNLOAD...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>BAIXAR MODELO (.GLB)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
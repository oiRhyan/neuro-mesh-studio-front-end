'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Search, ChevronRight, Star, Flame, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import Logo from '../../../public/image/logo.png'
import TopModel from '../../../public/image/card2.png'
import Updates from '../../../public/image/card3.png'
import CreateNow from '../../../public/image/card1.png'
import ComunnityModels from '../../../public/image/card4.png'

const HomePreviewCanvas = dynamic(
   () => import('@/components/Studio/ModelViewer/HomePreviewCanvas').then((mod) => mod.HomePreviewCanvas),
   { ssr: false }
);

export default function Home() {
   const [lastModelUrl, setLastModelUrl] = useState<string | null>(null);

   useEffect(() => {
      const cachedModel = localStorage.getItem('@neuro-mesh:last-model-url');
      if (cachedModel) {
         setLastModelUrl(cachedModel);
      }
   }, []);

   return (
      <div className="w-full h-full text-white p-4 md:p-8 font-sans selection:bg-purple-500/30 relative bottom-8">

         {/* Topbar / Navegação */}
         <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
               <Image src={Logo} alt='logo' height={180} width={180} />
            </div>

            <div className="flex-1 max-w-xl relative fontfamily">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder="Buscar modelos..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
               />
            </div>

            <nav className="fontfamily flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
               {['Noticias', 'Modelos da Comunidade'].map((tab, i) => (
                  <button
                     key={tab}
                     className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${i === 0 ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                  >
                     {tab}
                  </button>
               ))}
            </nav>
         </header>

         {/* Grid Principal */}
         <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* COLUNA ESQUERDA: Continue Criando (Hero Card) */}
            <div className="lg:col-span-5 min-h-[400px] lg:h-[500px] xl:h-[580px] relative rounded-3xl overflow-hidden group border border-white/10 bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-xl shadow-2xl">

               <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#27144d] via-[#24183e]/70 to-transparent" />
                  <div className="absolute top-0 bottom-0 left-0 w-36 bg-gradient-to-r from-[#20113f]/90 via-[#31205e]/50 to-transparent" />
                  <div className="absolute top-0 bottom-0 right-0 w-36 bg-gradient-to-l from-[#16294d]/70 via-[#1c2350]/30 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#241544]/50 to-transparent" />
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[500px] h-[220px] rounded-full bg-violet-600/15 blur-3xl" />
                  <div className="absolute top-24 right-0 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl" />
               </div>

               {lastModelUrl ? (
                  <div className="absolute inset-0 z-0 pointer-events-none opacity-100 group-hover:opacity-100 transition-opacity duration-700">
                     <Suspense fallback={<div className="w-full h-full animate-pulse bg-white/5" />}>
                        <HomePreviewCanvas modelUrl={lastModelUrl} />
                     </Suspense>
                  </div>
               ) : (
                  <Image
                     src={CreateNow}
                     alt='modelo'
                     width={1000}
                     height={10000}
                     className="object-cover opacity-100"
                  />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-[#050505]/30 to-transparent z-10 pointer-events-none" />
               <div className="absolute inset-0 z-20 flex flex-col justify-between p-6">
                  <div className="flex justify-between items-start">
                     <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-3 flex flex-col gap-1 shadow-lg">
                        <span className="fontfamily text-gray-400 text-xs font-medium uppercase tracking-wider">
                           {lastModelUrl ? "Última Sessão" : "Bem-vindo(a)!"}
                        </span>
                        <span className="fontfamily text-white font-semibold text-lg flex items-center gap-2">
                           <div className={`w-2 h-2 text-sm rounded-full animate-pulse ${lastModelUrl ? 'bg-green-500' : 'bg-purple-500'}`} />
                           {lastModelUrl ? "Continue de onde parou" : "Acesse o Studio"}
                        </span>
                     </div>

                     {lastModelUrl && (
                        <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 border border-white/5 shadow-lg">
                           <Star size={14} className="text-yellow-500" />
                           <span className="text-sm font-medium">Draft</span>
                        </div>
                     )}
                  </div>

                  <div>
                     <p className="fontfamily text-gray-300 text-sm mb-4 max-w-[85%] drop-shadow-md">
                        {lastModelUrl
                           ? "Seu modelo mais recente pode continuar sendo trabalhado caso tenha sido salvo."
                           : "Tem uma ideia de modelo 3D incrível? Acesse agora o Studio e comece a criar"}
                     </p>

                     <Link href="/studio" className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full p-2 pl-6 transition-all group/btn shadow-xl">
                        <span className="fontfamily font-medium text-xm">
                           {lastModelUrl ? "Abrir no Studio" : "Começar a Criar"}
                        </span>
                        <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-105">
                           <ChevronRight size={20} />
                        </div>
                     </Link>
                  </div>
               </div>
            </div>

            {/* COLUNA CENTRAL */}
            <div className="lg:col-span-4 flex flex-col gap-6 min-h-[400px] lg:h-[500px] xl:h-[580px]">
               <div className="flex-1 bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                  <Image
                     src={TopModel}
                     alt='modelo'
                     fill
                     className="object-cover opacity-70 transition-opacity duration-500"
                  />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                     <div>
                        <h3 className="fontfamily text-2xl font-bold flex items-center gap-2 mt-4">
                           Lançamento! <Flame className="text-orange-500" size={24} />
                        </h3>
                        <p className="fontfamily text-gray-400 text-sm mt-4">NeuroMeshStudio está oficialmente<br></br>disponível! Crie e salve seus modelos<br></br>favoritos, compartilhe com <br></br>a comunidade e aproveite para nos<br></br> passar um feedback, estamos anciosos<br></br>para melhorar a plataforma!</p>
                     </div>
                     <div className="bg-black/50 fontfamily backdrop-blur-md self-start rounded-full px-3 py-1.5 flex items-center gap-1 border border-white/10 mt-auto">
                        <Flame size={14} className="text-orange-500" />
                        <span className="text-sm font-medium">9.8k interações</span>
                     </div>
                  </div>
               </div>

               <div className="flex-[0.8] bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                  <Image
                     src={Updates}
                     alt='modelo'
                     fill
                     className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                     <span className="fontfamily text-xs font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 rounded-md">
                        Atualização
                     </span>
                     <h4 className="fontfamily text-xl font-bold mb-2 mt-7">Versão 1.03</h4>
                     <div className="fontfamily text-gray-400 text-sm">
                        <span className="font-semibold">Changelog:</span>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                           <li>Remova modelos da sua lista</li>
                           <li>Continue criando de onde parou</li>
                           <li>Modelos da comunidade</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>

            {/* COLUNA DIREITA */}
            <div className="lg:col-span-3 flex flex-col gap-6 min-h-[400px] lg:h-[500px] xl:h-[580px]">
               <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex-1 flex flex-col">

                  {/* Background */}
                  <Image
                     src={ComunnityModels}
                     alt="comunidade"
                     fill
                     className="absolute inset-0 object-cover opacity-70 -z-10"
                  />

                  <div className="flex justify-between items-center mb-4">
                     <span className="fontfamily text-xm font-bold tracking-wider text-white">
                        Confira os melhores<br></br>criadores da semana
                     </span>

                     <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ChevronRight size={14} />
                     </button>
                  </div>

                  <p className="fontfamily text-sm text-gray-300 mb-4">
                     Top criadores da semana
                  </p>

                  <div className="flex -space-x-3 mt-auto">
                     {[1, 2, 3].map((i) => (
                        <div
                           key={i}
                           className="w-10 h-10 rounded-full border-2 border-[#121216] bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center"
                        >
                           <span className="text-xs font-bold">P{i}</span>
                        </div>
                     ))}
                  </div>

               </div>

               <div className="bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex-1 flex flex-col justify-between">
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="fontfamily text-xm font-bold tracking-wider text-white">Newsletter</span>
                     </div>
                     <p className="fontfamily text-sm text-gray-300">Receba noticias e atualizações exclusivas sobre o NeuroMesh.</p>
                  </div>
                  <div className="fontfamily flex flex-col gap-2 mt-4">
                     <input
                        type="email"
                        placeholder="Seu email..."
                        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white"
                     />
                     <button className="w-full fontfamily bg-white text-black font-semibold rounded-lg py-2 text-sm hover:bg-gray-200 transition-colors">
                        Inscrever-se
                     </button>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex-[0.8] flex flex-col justify-between relative overflow-hidden group cursor-pointer">
                  <div className="flex justify-between items-center relative z-10">
                     <span className="fontfamily text-xl font-bold tracking-wider text-white">Status da <br></br> plataforma</span>
                  </div>
                  <p className="text-sm text-gray-300 relative z-10 mt-2">GPU Cluster Operacional</p>
                  <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 bg-green-500/20 rounded-full blur-xl" />
               </div>

            </div>
         </main>
      </div>
   );
}
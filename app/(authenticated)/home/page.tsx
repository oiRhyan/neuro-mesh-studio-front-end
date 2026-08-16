'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Search, ChevronRight, Star, Flame, ChevronLeft, Cookie } from 'lucide-react';
import Image from 'next/image';
import Logo from '../../../public/image/logo.png';
import TopModel from '../../../public/image/card2.png';
import Updates from '../../../public/image/card3.png';
import CreateNow from '../../../public/image/card1.png';
import ComunnityModels from '../../../public/image/card4.png';
import ModelPublicCard from '@/components/Studio/ModelPublicCard/ModelPublicCard';
import { useQuery } from '@tanstack/react-query';
import { getPublicModels } from '@/app/services/ModelService';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModelDetailsModal } from '@/components/Studio/ModelViewer/ModalDetailsViewer';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const HomePreviewCanvas = dynamic(
   () => import('@/components/Studio/ModelViewer/HomePreviewCanvas').then((mod) => mod.HomePreviewCanvas),
   { ssr: false }
);

export default function Home() {
   const [lastModelUrl, setLastModelUrl] = useState<string | null>(null);
   const [currentTab, setCurrentTab] = useState<string>("Noticias");
   const [currentPage, setCurrentPage] = useState(1);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedModelData, setSelectedModelData] = useState<any>(null);
   const [searchTerm, setSearchTerm] = useState<string>("");

   const { data } = useQuery({
      queryKey: ['public-models'],
      queryFn: getPublicModels
   });

   useEffect(() => {
      const cachedModel = localStorage.getItem('@neuro-mesh:last-model-url');
      if (!cachedModel) {
         return;
      } else {
         setLastModelUrl(cachedModel);
      }
   }, []);

   useEffect(() => {
      if (searchTerm.trim() !== '') {
         setCurrentTab("Modelos da Comunidade");
      }
      setCurrentPage(1);
   }, [searchTerm]);

   const filteredModels = (data?.publicModels ?? []).filter((m: any) => {
      const query = searchTerm.toLowerCase().trim();
      if (!query) return true;
      const matchesTitle = m.modelTitle?.toLowerCase().includes(query);
      const matchesAuthor = m.user?.userName?.toLowerCase().includes(query);
      return matchesTitle || matchesAuthor;
   });

   return (
      <div className="w-full h-full text-white p-4 md:p-8 font-sans selection:bg-purple-500/30 relative bottom-8">
         <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
               <Image src={Logo} alt='logo' height={180} width={180} />
            </div>

            <div className="flex-1 max-w-xl relative fontfamily">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder="Buscar modelos por título ou autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
               />
            </div>

            <nav className="fontfamily flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
               {['Noticias', 'Modelos da Comunidade'].map((tab) => (
                  <button
                     key={tab}
                     onClick={() => setCurrentTab(tab)}
                     className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${tab === currentTab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                  >
                     {tab}
                  </button>
               ))}
            </nav>
         </header>

         <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {currentTab === "Noticias" ? (
               <>
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
                           height={1000}
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
                              <span className="fontfamily font-medium text-sm">
                                 {lastModelUrl ? "Abrir no Studio" : "Começar a Criar"}
                              </span>
                              <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-105">
                                 <ChevronRight size={20} />
                              </div>
                           </Link>
                        </div>
                     </div>
                  </div>

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
                              <p className="fontfamily text-gray-400 text-sm mt-4">
                                 NeuroMeshStudio está oficialmente<br></br>disponível! Crie e salve seus<br></br>modelos favoritos,<br></br>compartilhe com a comunidade<br></br>e nos dê seu feedback.
                              </p>
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

                  <div className="lg:col-span-3 flex flex-col gap-6 min-h-[400px] lg:h-[500px] xl:h-[580px]">
                     <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex-1 flex flex-col">
                        <Image
                           src={ComunnityModels}
                           alt="comunidade"
                           fill
                           className="absolute inset-0 object-cover opacity-70 -z-10"
                        />
                        <div className="flex justify-between items-center mb-4">
                           <span className="fontfamily text-sm font-bold tracking-wider text-white">
                              Confira os melhores criadores da semana
                           </span>
                           <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                              <ChevronRight size={14} />
                           </button>
                        </div>
                        <p className="fontfamily text-xs text-gray-300 mb-4">Top criadores da semana</p>

                        <div className="flex -space-x-2.5 mt-auto items-center select-none">
                           {(() => {
                              const seenNames = new Set();
                              const uniqueUsers = data?.publicModels
                                 ?.filter((m: any) => {
                                    if (!m.user?.userName) return false;
                                    const isDuplicate = seenNames.has(m.user.userName);
                                    seenNames.add(m.user.userName);
                                    return !isDuplicate;
                                 })
                                 ?.map((m: any) => m.user) ?? [];
                              const displayedUsers = uniqueUsers.slice(0, 3);
                              const remainingCount = uniqueUsers.length - 3;

                              return (
                                 <>
                                    {displayedUsers.map((user: any, index: number) => (
                                       <div
                                          key={index}
                                          className="w-9 h-9 rounded-full border-2 border-[#121216] bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center overflow-hidden shadow-md"
                                       >
                                          <Avatar className="w-full h-full">
                                             <AvatarImage src={user.profileImage} alt={`@${user.userName}`} className="object-cover" />
                                             <AvatarFallback className="text-[10px] bg-[#16161f] text-purple-400 font-semibold">
                                                {user.userName?.substring(0, 2).toUpperCase() || "NM"}
                                             </AvatarFallback>
                                          </Avatar>
                                       </div>
                                    ))}
                                    {remainingCount > 0 && (
                                       <div className="w-9 h-9 rounded-full border-2 border-[#121216] bg-[#16161f] flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-md z-10 tracking-tighter">
                                          +{remainingCount}
                                       </div>
                                    )}
                                 </>
                              );
                           })()}
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex-1 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-center mb-2">
                              <span className="fontfamily text-sm font-bold tracking-wider text-white">Newsletter</span>
                           </div>
                           <p className="fontfamily text-xs text-gray-300">Receba notícias e atualizações exclusivas sobre o NeuroMesh.</p>
                        </div>
                        <div className="fontfamily flex flex-col gap-2 mt-4">
                           <input
                              type="email"
                              placeholder="Seu email..."
                              className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white"
                           />
                           <button className="w-full fontfamily bg-white text-black font-semibold rounded-lg py-2 text-sm hover:bg-gray-200 transition-colors" onClick={() => toast.success("Em breve entraremos em contato!")}>
                              Inscrever-se
                           </button>
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-indigo-900/10 to-[#121216]/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex-[0.8] flex flex-col justify-between relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10 flex flex-col gap-1.5">
                           <div className="flex justify-between items-center">
                              <span className="fontfamily text-lg font-bold tracking-wider text-white">Status da plataforma</span>
                           </div>
                           <p className="text-xs fontfamily text-gray-100 leading-relaxed pr-2">
                              Aqui você confere os status da plataforma e o funcionamento atual dos serviços.
                           </p>
                        </div>
                        <div className="flex items-center gap-2.5 relative z-10 mt-4">
                           <div className="w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.9)]" />
                           <p className="text-sm fontfamily text-gray-300">GPU Cluster Operacional</p>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-colors duration-500" />
                     </div>
                  </div>
               </>
            ) : (
               <div className="w-full lg:col-span-12 flex flex-col justify-between overflow-hidden">
                  {filteredModels.length === 0 ? (
                     <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-3xl">
                        <p className="fontfamily text-gray-300 text-lg font-medium">Nenhum modelo encontrado</p>
                        <p className="fontfamily text-gray-500 text-sm mt-1">Tente pesquisar por outros termos ou verifique a ortografia.</p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                        {(() => {
                           const ITEMS_PER_PAGE = 8;
                           const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
                           const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                           const selectedItems = filteredModels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                           return (
                              <>
                                 {selectedItems.map((m: any, index: number) => (
                                    <div
                                       key={m.id || index}
                                       onClick={() => {
                                          setSelectedModelData(m);
                                          setIsModalOpen(true);
                                       }}
                                       className="cursor-pointer transition-transform hover:scale-[1.01]"
                                    >
                                       <ModelPublicCard
                                          title={m.modelTitle}
                                          imageUrl={m.modelThumbnail}
                                          avatarUrl={m.user?.profileImage}
                                          authorName={m.user?.userName}
                                       />
                                    </div>
                                 ))}

                                 {totalPages > 1 && (
                                    <div className="col-span-2 md:col-span-3 lg:col-span-4 flex items-center justify-end gap-2 text-xs font-medium text-gray-400 mt-4 pr-1 select-none">
                                       <button
                                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                          disabled={currentPage === 1}
                                          className="fontfamily w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                       >
                                          <ChevronLeft size={14} />
                                       </button>

                                       <div className="fontfamily flex items-center gap-1">
                                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                             <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-xl border text-[11px] transition-all cursor-pointer ${page === currentPage
                                                   ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 font-semibold'
                                                   : 'bg-transparent border-transparent hover:bg-white/5 hover:text-white'
                                                   }`}
                                             >
                                                {page}
                                             </button>
                                          ))}
                                       </div>

                                       <button
                                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                          disabled={currentPage === totalPages}
                                          className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                       >
                                          <ChevronRight size={14} />
                                       </button>
                                    </div>
                                 )}
                              </>
                           );
                        })()}
                     </div>
                  )}

                  <ModelDetailsModal
                     isOpen={isModalOpen}
                     onClose={() => setIsModalOpen(false)}
                     model={selectedModelData}
                  />
               </div>
            )}
         </main>
      </div>
   );
}
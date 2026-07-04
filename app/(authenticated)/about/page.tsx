'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Pencil, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon
} from '@/components/ui/input-group'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Cookies from 'js-cookie'
import './style.scss'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getListModels } from '@/app/services/ModelService'
import Image from 'next/image'
import { UpdateUserFormRequest } from '@/types/User.type'
import { UpdateUser, getUserById } from '@/app/services/UserService'

const editProfileSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório.'),
  bio: z.string().max(160, 'Máximo de 160 caracteres.'),
  banner: z.any().optional(),
  imageProfile: z.any().optional()
})

type EditProfileFormData = z.infer<typeof editProfileSchema>

export default function About() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [user, setUser] = useState({ userName: '', imageProfile: '', banner: '', biography: '', id: '' });

  useEffect(() => {
    setIsMounted(true);
    const userCookie = Cookies.get("user");
    if (userCookie) setUser(JSON.parse(userCookie));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['userModels', user.id],
    queryFn: () => getListModels(user.id),
    enabled: !!user.id,
  });

  const models = Array.isArray(data) ? data : (data?.models ?? []);

  const fileInputAvatar = useRef<HTMLInputElement>(null);
  const fileInputBanner = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    values: {
      name: user.userName || '',
      bio: user.biography || '',
      banner: '',
      imageProfile: ''
    }
  });

  const onUpdateUser = async (data: EditProfileFormData) => {
    const request: UpdateUserFormRequest = {
      Name: data.name,
      Biography: data.bio,
      ImageBanner: data.banner,
      ImageProfile: data.imageProfile
    }

    try {
      const response = await UpdateUser(user.id, request);
      return response;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditProfileFormData) => {
      await onUpdateUser(data);
      const freshUser = await getUserById(user.id);
      return freshUser;
    },
    onSuccess: (freshUser) => {
      if (freshUser) {
        const formattedUser = {
          id: freshUser.id,
          userName: freshUser.userProfile.userName,
          biography: freshUser.userProfile.biography,
          banner: freshUser.userProfile.bannerImage,
          imageProfile: freshUser.userProfile.profileImage 
        };

        Cookies.set("user", JSON.stringify(formattedUser), {
          sameSite: "strict",
          expires: 7
        });
      }

      setIsOpen(false);
      setAvatarPreview(null);
      setBannerPreview(null);
      window.location.reload();
    },
    onError: (e) => {
      console.warn("Erro ao sincronizar perfil:", e);
    }
  })

  if (!isMounted) return null;

  return (
    <div className="fontfamily flex flex-col xl:flex-row gap-8 w-full max-w-7xl mx-auto p-5 mt-5 xl:h-[650px]">
      <div className="custom-glass-card flex-1 relative flex flex-col">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="edit-profile-btn absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-medium transition-all">
              <Pencil size={16} /> <span>Editar</span>
            </button>
          </DialogTrigger>

          <DialogContent className="fontfamily sm:max-w-[500px] bg-[#121212] text-white border-zinc-800">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>

            <div className="fontfamily py-4 space-y-6">
              <div className="relative h-28 bg-zinc-900 rounded-lg overflow-hidden group cursor-pointer" onClick={() => fileInputBanner.current?.click()}>
                {(bannerPreview || user.banner) ? (
                  <img src={bannerPreview || user.banner} className="w-full h-full object-cover" alt="Banner Preview" />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-600">Alterar Banner</div>
                )}
                <input type="file" ref={fileInputBanner} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setBannerPreview(URL.createObjectURL(file));

                    setValue('banner', file, {
                      shouldValidate: true,
                      shouldDirty: true
                    });
                  }
                }} />
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-900 border-2 border-zinc-800 cursor-pointer" onClick={() => fileInputAvatar.current?.click()}>
                    <img src={avatarPreview || user.imageProfile} className="w-full h-full object-cover" alt="Avatar Preview" />
                    <input type="file" ref={fileInputAvatar} className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarPreview(URL.createObjectURL(file));

                        setValue('imageProfile', file, {
                          shouldValidate: true,
                          shouldDirty: true
                        });
                      }
                    }} />
                  </div>
                  <div className="flex-1">
                    <FieldLabel className="text-xs text-zinc-400">Nome</FieldLabel>
                    <InputGroup className="mt-1">
                      <InputGroupAddon><User size={16} /></InputGroupAddon>
                      <InputGroupInput {...register('name')} />
                    </InputGroup>
                    {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
                  </div>
                </div>
                <div className="flex flex-col">
                  <FieldLabel className="text-xs text-zinc-400">Biografia</FieldLabel>
                  <textarea
                    {...register('bio')}
                    className="mt-1 w-full h-24 bg-transparent border border-zinc-800 rounded-md p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none transition-all"
                    placeholder="Escreva algo sobre você..."
                  />
                  {errors.bio && <span className="text-red-500 text-xs mt-1 block">{errors.bio.message}</span>}
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubmit((data) => updateProfileMutation.mutate(data))}
              className="fontfamily w-full bg-white text-black hover:bg-zinc-200"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogContent>
        </Dialog>

        <div className="user-infos-banner relative z-10 shrink-0 min-h-[160px] bg-zinc-900 rounded-t-xl overflow-hidden">
          {user.banner && (
            <Image src={user.banner} alt='banner' fill priority className="object-cover" />
          )}
        </div>

        <div className="px-8 pb-8 relative z-20 flex flex-col flex-1 min-h-0">
          <div className="flex items-end gap-4 -mt-12 mb-8">
            <Avatar className="w-24 h-24 border-4 border-[#121212] rounded-full bg-background">
              <AvatarImage src={avatarPreview || user.imageProfile} />
            </Avatar>
            <div className="mb-1">
              <h1 className="text-2xl font-bold text-white">{user.userName}</h1>
              <p className="text-zinc-400 text-sm">{user.biography}</p>
            </div>
          </div>

          <div className="user-models-section flex flex-col flex-1 min-h-0">
            <h2 className="text-lg font-semibold text-white mb-4">Modelos criados</h2>
            <div className="custom-scrollbar grid grid-cols-3 gap-4 overflow-y-auto flex-1">
              {isLoading ? <p className="text-zinc-500">Carregando...</p> :
                models.map((item: any) => (
                  <div key={item.id} className="model-card">
                    <img src={item.thumbnail} className="h-32 w-full object-cover rounded-lg mb-2 bg-zinc-800" alt={item.title} />
                    <p className="text-sm text-zinc-300 truncate">{item.title}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* About Card Modificado */}
      <div className="custom-glass-card flex-1 p-8 relative overflow-hidden flex flex-col justify-center">
        {/* Imagem de Fundo (Marca d'água / Transparente) */}
        <div 
          className="absolute inset-0 z-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'url("/image/aboutBackground.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Conteúdo de Texto */}
        <div className="relative z-10 flex flex-col gap-4 text-zinc-300">
          <h2 className="text-3xl font-extrabold text-white mb-2">Sobre o NeuroMeshStudio</h2>
          <p className="font-medium text-white">
            Obrigado por utilizar o NeuroMeshStudio!
          </p>
          <p className="text-sm leading-relaxed">
            O NeuroMeshStudio foi desenvolvido para tornar a criação, edição e gerenciamento de modelos 3D mais simples e acessíveis. Utilizando inteligência artificial, a plataforma permite transformar ideias em modelos tridimensionais, organizá-los em um único ambiente e acelerar o fluxo de trabalho de artistas, desenvolvedores e criadores.
          </p>
          <p className="text-sm leading-relaxed">
            Nosso objetivo é oferecer uma experiência intuitiva, unindo tecnologias modernas de geração 3D, processamento de imagens e ferramentas de edição para facilitar o desenvolvimento de projetos criativos.
          </p>
        </div>
      </div>
      
    </div>
  )
}
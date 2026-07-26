'use client'

import { RotateCcw, Download } from 'lucide-react'
import { RiSave3Fill } from "react-icons/ri"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { InputGroup, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import '../studio.scss'
import { useRef, useState } from 'react'
import { SaveModelRequest } from '@/types/ModelRequest'
import { Spinner } from '@/components/ui/spinner'
import Cookies from 'js-cookie'
import { ThumbnailViewer } from './ThumbnailViewer'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveModelSchema } from '../../../types/schemas/save-model.schema'
import { z } from 'zod'
import { deleteModel, saveModel } from './../../../app/services/ModelService';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { HiTrash } from "react-icons/hi2";

type SaveModelFormData = z.infer<typeof saveModelSchema>

type ModelToolBarProps = {
  modelUrl: string
  modelThumbnail?: string
  modelId: string
  onModelSaved?: (newModelId: string) => void
}

export function ModelToolbar({ modelUrl, modelId, onModelSaved }: ModelToolBarProps) {
  const userRequest = Cookies.get("user");
  const userObject = userRequest ? JSON.parse(userRequest) : {};
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setDeleteIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const form = useForm<SaveModelFormData>({
    resolver: zodResolver(saveModelSchema),
    defaultValues: {
      userId: userObject?.id,
      title: '',
      thumbnail: '',
      description: '',
      public: false,
      model: modelUrl,
    }
  })

  const captureRef = useRef<(() => string) | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = form;

  const isPublic = watch('public');

  const checkIsModelAlreadySaved = () => {
    return Boolean(modelId && modelId !== '' && modelId !== 'undefined' && modelId !== 'null');
  };

  const handleOpenSaveModal = () => {
    if (checkIsModelAlreadySaved()) {
      toast.info("O modelo já está salvo!");
      return;
    }

    setIsOpen(true);
  };

  const saveModelMutation = useMutation({
    mutationFn: async (data: SaveModelFormData) => {
      let thumbnail: string | File = ''

      if (captureRef.current) {
        thumbnail = captureRef.current()
      }

      const request: SaveModelRequest = {
        userId: data.userId,
        title: data.title,
        description: data.description,
        public: data.public,
        model: modelUrl,
        thumbnail: thumbnail,
      }

      const response = await saveModel(request);
      return response;
    },
    onSuccess: (data) => {
      setIsOpen(false);
      toast.success("Modelo salvo com sucesso!");

      if (data?.id || data?._id) {
        onModelSaved?.(data.id || data._id);
      }

      queryClient.invalidateQueries({
        queryKey: ['userModels', userObject.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['public-models']
      });
      reset({
        userId: userObject.id,
        title: '',
        thumbnail: '',
        description: '',
        public: false,
        model: modelUrl,
      });
    },
    onError: () => {
      setIsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (idToDelete: string) => {
      const response = await deleteModel(idToDelete);
      return response;
    },
    onSuccess: () => {
      setDeleteIsOpen(false);
      toast.success("Modelo excluído com sucesso!");
      onModelSaved?.('');
      queryClient.invalidateQueries({
        queryKey: ['userModels', userObject.id]
      });
    },
    onError: () => {
      setDeleteIsOpen(false);
      toast.error("Este modelo não está salvo na sua lista de modelos atual");
    }
  })

  const onSubmit = async (data: SaveModelFormData) => {
    if (saveModelMutation.isPending) return;

    if (checkIsModelAlreadySaved()) {
      toast.info("O modelo já está salvo!");
      setIsOpen(false);
      return;
    }

    try {
      await saveModelMutation.mutateAsync(data);
    } catch (error) {
      console.error("Erro ao salvar o modelo:", error);
      toast.error("Erro ao salvar o modelo.");
    }
  }

  const onError = (formErrors: typeof errors) => {
    console.warn("Formulário inválido. Verifique os campos abaixo:", formErrors)
  }

  const handleDownloadModel = async () => {
    if (!modelUrl) {
      toast.error("URL do modelo não encontrada.");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(modelUrl);

      if (!response.ok) {
        throw new Error("Modelo não encontrado.");
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (
        !contentType.includes("model/gltf-binary") &&
        !contentType.includes("application/octet-stream")
      ) {
        throw new Error("Arquivo inválido.");
      }

      const filename =
        modelUrl.split("/").pop()?.split("?")[0] || "modelo-3d.glb";

      if (!filename.toLowerCase().endsWith(".glb")) {
        throw new Error("Arquivo inválido.");
      }

      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = localUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(localUrl);

      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao fazer o download do modelo:", error);
      toast.error(
        "Não foi possível baixar o modelo. Salve-o primeiro em sua biblioteca."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="viewer-toolbar">
      <button>
        <RotateCcw size={20} />
      </button>

      <Dialog open={isDeleteOpen} onOpenChange={setDeleteIsOpen}>
        <button onClick={() => setDeleteIsOpen(true)}>
          <HiTrash size={20} />
        </button>
        <DialogContent className='modal-delete-model'>
          <DialogHeader>
            <DialogTitle>Deseja excluir o modelo?</DialogTitle>
            <DialogDescription className='fontfamily'>
              Ao confirmar seu modelo será excluído da sua lista permanentemente
            </DialogDescription>
          </DialogHeader>
          <div className='w-full flex gap-5 justify-end'>
            <Button className='fontfamily' onClick={() => deleteMutation.mutateAsync(modelId)}>
              Excluir
            </Button>
            <Button className='fontfamily text-black' variant={'outline'} onClick={() => setDeleteIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <button onClick={handleOpenSaveModal}>
        <RiSave3Fill size={20} color="white" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="modal-save-model">
          <DialogHeader>
            <DialogTitle>Salvar meu Modelo</DialogTitle>
            <DialogDescription>Configure os dados do modelo</DialogDescription>
          </DialogHeader>

          <div className="modal-body">
            <div className="modal-form">
              <FieldGroup className="fontfamily max-w-sm">
                <Field>
                  <FieldLabel htmlFor="title">Título</FieldLabel>
                  <InputGroup className="h-auto">
                    <InputGroupInput
                      id="title"
                      {...register('title')}
                      placeholder="Defina um título para seu modelo gerado"
                    />
                  </InputGroup>
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  <FieldDescription>
                    O título definido será exibido a outros criadores caso este modelo seja publicado.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Descrição</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id="description"
                      {...register('description')}
                      placeholder="Descreva um pouco sobre seu modelo gerado"
                      className="h-32 resize-none overflow-y-auto font-mono text-sm"
                    />
                  </InputGroup>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                  <FieldDescription>
                    A descrição definida será exibida a outros criadores caso este modelo seja publicado.
                  </FieldDescription>
                </Field>
              </FieldGroup>

              <div className="public-switch">
                <div>
                  <FieldLabel htmlFor="public-model" className='fontfamily'>Modelo público</FieldLabel>
                  <p>Permitir que outros criadores visualizem este modelo.</p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={(checked) =>
                    setValue('public', checked, { shouldValidate: true })
                  }
                />
              </div>

              <Button
                type="button"
                onClick={handleSubmit(onSubmit, onError)}
                className='fontfamily'
                disabled={saveModelMutation.isPending}
              >
                {saveModelMutation.isPending ? (
                  <> <Spinner /> <h1> Salvar </h1> </>
                ) : (
                  <h1> Salvar </h1>
                )}
              </Button>
            </div>

            <div className="modal-viewer">
              <div>
                <h3>Defina a capa</h3>
                <p>Arraste o modelo para definir a thumbnail.</p>
              </div>
              <ThumbnailViewer
                key={modelUrl}
                modelUrl={modelUrl}
                onCaptureReady={(captureFn) => {
                  captureRef.current = captureFn
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <button
        onClick={handleDownloadModel}
        disabled={isDownloading}
        className={isDownloading ? "opacity-50 cursor-not-allowed" : ""}
      >
        <Download size={20} className={isDownloading ? "animate-bounce" : ""} />
      </button>
    </div>
  )
}
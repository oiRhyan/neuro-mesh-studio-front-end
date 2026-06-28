'use client'

import { RotateCcw, Sun, Download } from 'lucide-react'
import { RiSave3Fill } from "react-icons/ri"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { InputGroup, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import '../studio.scss'
import { useRef, useState } from 'react'
import { SaveModelRequest } from '@/types/ModelRequest'
import Cookies from 'js-cookie'
import { ThumbnailViewer } from './ThumbnailViewer'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveModelSchema } from '../../../types/schemas/save-model.schema'
import { z } from 'zod'
import { saveModel } from './../../../app/services/ModelService';
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type SaveModelFormData = z.infer<typeof saveModelSchema>

type ModelToolBarProps = {
  modelUrl: string
  modelThumbnail: string
}

export function ModelToolbar({ modelUrl }: ModelToolBarProps) {
  const userRequest = Cookies.get("user");
  const userObject = userRequest ? JSON.parse(userRequest) : {};
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Estado para controlar o loading do download

  const form = useForm<SaveModelFormData>({
    resolver: zodResolver(saveModelSchema),
    defaultValues: {
      userId: userObject.id,
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

  const onSubmit = async (data: SaveModelFormData) => {
    console.log('Formulário válido! Chamou onSubmit.');
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

    try {
      const response = await saveModel(request);
      console.log("Payload enviado e modelo salvo com sucesso:", response);

      toast.success("Modelo salvo com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ['userModels', userObject.id]
      });
      setIsOpen(false);
      reset({
        userId: userObject.id,
        title: '',
        thumbnail: '',
        description: '',
        public: false,
        model: modelUrl,
      });

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
      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = localUrl;
      const filename = modelUrl.split('/').pop()?.split('?')[0] || 'modelo-3d.glb';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(localUrl);

      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao fazer o download do modelo:", error);
      toast.error("Falha ao baixar o arquivo do modelo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="viewer-toolbar">
      <button>
        <RotateCcw size={20} />
      </button>

      <button>
        <Sun size={20} />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button>
            <RiSave3Fill size={20} color="white" />
          </button>
        </DialogTrigger>
        <DialogContent className="modal-save-model">
        <DialogHeader>
          <DialogTitle>Salvar meu Modelo</DialogTitle>
          <DialogDescription>Configure os dados do modelo</DialogDescription>
        </DialogHeader>

          <div className="modal-body">
            <div className="modal-form">
              <FieldGroup className="max-w-sm">
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
                  <FieldLabel htmlFor="public-model">Modelo público</FieldLabel>
                  <p>Permitir que outros criadores visualizem este modelo.</p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={(checked) =>
                    setValue('public', checked, { shouldValidate: true })
                  }
                />
              </div>

              <Button onClick={handleSubmit(onSubmit, onError)}>Salvar</Button>
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
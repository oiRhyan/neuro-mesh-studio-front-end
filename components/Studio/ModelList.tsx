'use client'

import './studio.scss'
import { FaSearch } from "react-icons/fa"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ModelCard } from "./ModelCards/ModelCard"
import { useQuery } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { getListModels } from '@/app/services/ModelService'
import { TbCube3dSphere } from "react-icons/tb";

export type ModelListProps = {
  // Unificado em um único callback
  onSelectModel: (url: string, id: string) => void;
}

export function ModelList({ onSelectModel }: ModelListProps) {
  const userCookie = Cookies.get("user");
  const user = userCookie ? JSON.parse(userCookie) : {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userModels', user?.id],
    queryFn: () => getListModels(user.id),
    enabled: !!user?.id,
  });

  return (
    <aside className="floating-models flex flex-col h-full overflow-hidden">
      <div className="floating-models-header">
        <h3>Meus Modelos</h3>
      </div>

      <div className="floating-models-search">
        <InputGroup>
          <InputGroupInput
            type="search"
            placeholder="Pesquisar..."
          />
          <InputGroupAddon align="inline-end">
            <FaSearch color="white" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {data?.models.length === 0 && (
        <div className="flex mt-20 flex-col items-center justify-center gap-2 text-center">
          <TbCube3dSphere color="white" size={70} />
          <h1>Seus modelos salvos irão aparecer aqui</h1>
        </div>
      )}
      
      <div className="floating-models-grid flex-1 overflow-y-auto">
        {
          data?.models.map(m => (
            <ModelCard
              key={m.id}
              title={m.title}
              thumbnail={m.thumbnail}
              onClick={() => onSelectModel(m.model, m.id)} // Passa URL e ID juntas
            />
          ))
        }
      </div>
    </aside>
  )
}
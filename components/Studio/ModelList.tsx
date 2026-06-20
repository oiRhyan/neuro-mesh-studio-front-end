'use client'

import './studio.scss'
import { FaSearch } from "react-icons/fa"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ModelCard } from "./ModelCards/ModelCard"
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { getListModels } from '@/app/services/ModelService'
import { SavedModels } from '@/types/ModelRequest'

export type ModelListProps = {
  onSelectModel: (url: string) => void;
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
    <aside className="floating-models">
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

      <div className="floating-models-grid">
        {
          data?.models.map(m => (
            <ModelCard
              key={m.id}
              title={m.title}
              thumbnail={m.thumbnail}
              onClick={() => onSelectModel(m.model)}
            />
          ))
        }
      </div>

    </aside>
  )
}
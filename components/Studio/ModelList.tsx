import './studio.scss'
import { FaSearch } from "react-icons/fa"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { ModelCard } from "./ModelCards/ModelCard"

const mock = Array.from({ length: 8 }).map((_, index) => ({
  title: `Modelo ${index + 1}`,
  imageUrl: ''
}))

export function ModelList() {
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
        {mock.map((model, index) => (
          <ModelCard
            key={index}
            title={model.title}
            imageUrl={model.imageUrl}
          />
        ))}
      </div>

    </aside>
  )
}
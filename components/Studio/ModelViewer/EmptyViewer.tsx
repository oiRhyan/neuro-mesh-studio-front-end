import '../studio.scss'

export function EmptyViewer() {
  return (
    <div className="empty-viewer">

      <div className="empty-grid" />

      <div className="empty-content">
        <h2>Nenhum modelo carregado</h2>

        <p>
          Envie uma imagem para gerar um modelo 3D
        </p>
      </div>

    </div>
  )
}
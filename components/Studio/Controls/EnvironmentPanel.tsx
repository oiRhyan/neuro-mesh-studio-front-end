'use client'

import Image from 'next/image';

const biography = "Bem-vindo ao Studio, aqui você poderá criar diversos modelos 3D com base em imagens!\nAnexe uma imagem no canto esquerdo para iniciar, conforme a detecção de nosso modelo de Inteligência Artitificial você poderá gerar modelos esqueléticos e estilos estátua para exportações 3D e renderização de modelos para sua Game Engines e editor de vídeos."

export function EnvironmentPanel() {
  return (
    <div className="environment-panel">
      <h2>Neuro Mesh Studio</h2>
      <h3> 
        {biography}
      </h3>
      <div className='environment-panel-image'>
        <Image src='/image/studio-banner.png' fill alt='banner' className='rounded-xl'/>
      </div>

    </div>
  )
}
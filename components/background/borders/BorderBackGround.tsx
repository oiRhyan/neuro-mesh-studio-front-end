import './style.scss';

export default function MergedShape({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-[690px] h-[450px] merged-shape-wrapper">
      
      {/* Fundo com o conteúdo: Recebe o clip-path e o blur pelo CSS */}
      <div className="absolute inset-0 z-10 p-8 merged-shape-bg">
        {children}
      </div>

      {/* SVG: Usado APENAS para criar a moldura/borda por cima */}
      <svg
        viewBox="0 0 690 450"
        className="absolute inset-0 w-full h-full z-20 pointer-events-none"
      >
        <path
          d="
            M 35 10
            L 670 10
            Q 680 10 680 20
            L 680 430
            Q 680 440 670 440
            L 35 440
            Q 10 440 10 415
            L 10 35
            Q 10 10 35 10
            Z
          "
          fill="none" /* Fundo transparente para o CSS brilhar através */
          stroke="#000000" /* Cor da sua borda preta nos cantos */
          strokeWidth="6" /* Ajuste a grossura da moldura aqui */
        />
      </svg>

    </div>
  );
}
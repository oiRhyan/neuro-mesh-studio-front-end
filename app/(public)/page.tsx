"use client"
import { HomeBackground } from '@/components/background/HomeBackground';
import '../style.scss';
import { SiUnrealengine } from "react-icons/si";
import { SiBlender } from "react-icons/si";
import { SiGodotengine } from "react-icons/si";
import { SiUnity } from "react-icons/si";
import { SiCinema4D } from "react-icons/si";
import CardNav from '@/components/CardNav/CardNav';
import logo from '../../public/image/logo.png';
import models from '../../public/image/main_image.png';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function Home() {
  const router: AppRouterInstance = useRouter();

  const items = [
    {
      label: "About",
      bgColor: "#1B1722",
      textColor: "#fff",
      links: [
        {
          label: "Company",
          href: "/company",
          ariaLabel: "About Company"
        },
        {
          label: "Careers",
          href: "/careers",
          ariaLabel: "About Careers"
        }
      ]
    },
    {
      label: "Projects",
      bgColor: "#2F293A",
      textColor: "#fff",
      links: [
        {
          label: "Featured",
          href: "/projects/featured",
          ariaLabel: "Featured Projects"
        },
        {
          label: "Case Studies",
          href: "/projects/case-studies",
          ariaLabel: "Project Case Studies"
        }
      ]
    },
    {
      label: "Contact",
      bgColor: "#2F293A",
      textColor: "#fff",
      links: [
        {
          label: "Email",
          href: "mailto:hello@neuromesh.com",
          ariaLabel: "Email us"
        },
        {
          label: "Twitter",
          href: "https://twitter.com/neuromesh",
          ariaLabel: "Twitter"
        },
        {
          label: "LinkedIn",
          href: "https://linkedin.com/company/neuromesh",
          ariaLabel: "LinkedIn"
        }
      ]
    }
  ];

  return (
    <main className="main">
      <HomeBackground />
      <section className="content-layer">
        <CardNav
          logo={logo}
          logoAlt="NeuroMeshLogo"
          items={items}
          baseColor="#121212"
          menuColor="#FFFFFF"
          buttonBgColor="#FFFFFF"
          buttonTextColor="#121212"
          ease="power3.out"
          onClick={
            () => router.push('/login')
          }
        />
        <div className="main-container">
          {/* Coluna 1: Textos da Esquerda */}
          <div className="main-texts">
            <h1>Seu HUB pessoal de Modelagem 3D com IA</h1>
            <h2>
              Gere, refine e exporte modelos 3D com IA em segundos.
              Transforme conceitos em assets prontos para produção.
            </h2>
            <div>
              <Button size={'lg'} variant={'default'} className='button' onClick={() => router.push('/login')}>
                Comece a criar
              </Button>
            </div>
            <div className='discovery'>
              <h3> Compatível com </h3>
              <div className='flex flex-row justify-center gap-6'>
                <SiUnrealengine size='25px' />
                <SiBlender size='25px' />
                <SiGodotengine size='25px' />
                <SiUnity size='25px' />
                <SiCinema4D size='25px' />
              </div>
            </div>
          </div>

          {/* Coluna 2: Imagem Central */}
          <div className="main-image">
            <Image
              src={models}
              height={650}
              quality={1000}
              alt="model-art"
              priority
              className="hero-model-image"
            />
          </div>

          {/* Coluna 3: Textos da Direita (Sem o container extra em volta) */}
          <div className="main-texts-2">
            <h2>Integração de texturas</h2>
            <h4>Seus modelos são gerados com texturas de alta qualidade em segundos</h4>

            <h2>Exportação</h2>
            <h4>Exporte modelos 3D para motores gráficos e game engines</h4>

            <h2>Manipulação de Modelo</h2>
            <h4>Visualize seu modelo 3D em tempo real, você pode criar via chat ou a partir de imagens</h4>
          </div>
        </div>
      </section>
    </main >
  );
}

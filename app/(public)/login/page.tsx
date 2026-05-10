import '../../style.scss';
import Image from 'next/image';
import Models from '../../../public/image/pikachu_remake.png';
import Logo from '../../../public/image/logo.png';
import Silk from '@/components/Silk';

export default function Login() {
   return (
      <main className='main-login'>
         <div className='content-login'>
            <Image src={Models} alt='background' height={780} />
            <div className='content-input'>

            </div>
         </div>
      </main>
   )
}
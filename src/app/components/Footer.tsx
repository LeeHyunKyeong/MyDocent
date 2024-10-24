"use client";
import { useState } from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';

const Footer: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // 버튼이 열려 있는지 상태 관리
  const router = useRouter();

  const handleToggle = () => {
    setIsOpen(!isOpen); // 상태를 반전시켜 토글 기능 구현
  };

  return (
    <footer>
      {!isOpen ? (
        <button 
          className='w-[56px] h-[56px] rounded-full bg-[#1B1E1F]' 
          onClick={handleToggle}
        >
          <Image 
           src="/logo/info.svg"
           alt="Info"
           width={64}
           height={64}
          />
        </button>
      ) : (
        <div className='flex w-[272px] h-[56px] rounded-[40px] p-[6px] gap-[10px] bg-[#1B1E1F]'>
            <button 
            className='w-[78px] h-[44px] rounded-[30px] gap-[10px] bg-[#2C3032]'
            onClick={() => router.push('/main/mypage')}
            >
            내 정보
            </button>
          <button 
          className='w-[122px] h-[44px] rounded-[30px] gap-[10px] bg-[#2C3032]'
          onClick={() => router.push('/main/favorites')}
          >
            감상한 작품
          </button>
          <button  
            className='w-[44px] h-[44px] rounded-[40px] p-[10px] bg-[#2C3032]' 
            onClick={handleToggle} // 다시 클릭 시 상태를 반전시켜 Info 버튼으로 돌아감
          >
            <Image 
           src="/logo/close.svg"
           alt="Info"
           width={32}
           height={32}
          />
          </button>
        </div>
      )}
    </footer>
  );
};

export default Footer;

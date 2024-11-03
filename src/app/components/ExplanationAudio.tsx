"use client";

import { useState, useRef, useEffect } from 'react';
import parsedText from '../initalText';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TextSegment {
  text: string;
  startTime: number;
}

interface ButtonData {
  id: number;
  emoji: string;
  text: string;
}

interface ReviewButtonsProps {
  openReview: boolean;
  review: number | null;
  handleChooseClick: (id: number) => void;
}

const ReviewButtons: React.FC<ReviewButtonsProps> = ({ openReview, review, handleChooseClick }) => {
  const buttons: ButtonData[] = [
    { id: 1, emoji: '🤩', text: '재미있어요' },
    { id: 2, emoji: '😮', text: '놀라워요' },
    { id: 3, emoji: '🙂', text: '좋아요' },
    { id: 4, emoji: '😓', text: '아쉬워요' },
  ];

  if (!openReview) return null;

  return (
    <div className='w-auto h-auto rounded-[30px] border border-[#2C3032] p-[10px] gap-[6px] bg-[#0C0D0F] flex flex-col'>
      {buttons.map(({ id, emoji, text }) => (
        <button
          key={id}
          onClick={() => handleChooseClick(id)}
          className={`font-normal w-auto h-[44px] rounded-[30px] p-[10px_12px] gap-[4px] text-[16px] leading-[24px] tracking-[-1%] my-1 ${
            review === id ? 'bg-[#FFFFFF] text-[#000000]' : 'bg-[#1B1E1F]'}`}
        >
          {emoji} {text}
        </button>
      ))}
    </div>
  );
};
ReviewButtons.displayName = 'ReviewButtons';  // displayName 추가

export default function TTSWithScroll() {
  const [count, setCount] = useState(0)

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<number>(0);
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [rateIndex, setRateIndex] = useState(0); // 속도 배열의 인덱스
  const playbackRates = [1, 1.25, 1.5, 1.75, 2]; // 속도 배열
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const segmentRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const router = useRouter();
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isReviewClick, setIsReviewClick] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [review, setReview] = useState<number | null>(null);

  const handleGoHome = () => {
    router.push('/');
  };

  const currentRate = playbackRates[rateIndex]; // 현재 재생 속도

  const togglePlaybackRate = () => { // 재생 속도 순환 함수
    const nextIndex = (rateIndex + 1) % playbackRates.length;
    setRateIndex(nextIndex);

    if (isPlaying) {
      window.speechSynthesis.cancel();
      playSegmentFromIndex(currentSegment, playbackRates[nextIndex]);
    }
  };

  useEffect(() => {
    const sentences = parsedText.description.split('\n').map((sentence, index) => ({
      text: sentence.trim(),
      startTime: index * 5,
    }));
    setSegments(sentences);
  }, []);

  useEffect(() => {
    if (isPlaying && synthRef.current) {
      const utterance = synthRef.current;
      utterance.text = segments[currentSegment]?.text || '';
      utterance.rate = currentRate;
      window.speechSynthesis.speak(utterance);
    }

    if (segmentRefs.current[currentSegment]) {
      segmentRefs.current[currentSegment]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSegment, isPlaying, currentRate, segments]);

  const playSegmentFromIndex = (index: number, rate: number) => {
    if (index < segments.length) {
      const utterance = new SpeechSynthesisUtterance(segments[index].text);
      utterance.rate = rate;
      currentUtteranceRef.current = utterance;

      utterance.onend = () => {
        playSegmentFromIndex(index + 1, rate);
      };

      setCurrentSegment(index);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
      setCurrentSegment(0);
      currentUtteranceRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      currentUtteranceRef.current = null;
    } else {
      playSegmentFromIndex(currentSegment, currentRate);
      setIsPlaying(true);
    }
  };

  const handleReviewClick = () => {
    setIsReviewClick(!isReviewClick);
    setOpenReview(!openReview);
  };

  const handleChooseClick = (id: number) => { 
    setReview(id);
    setOpenReview(false);
    setIsReviewClick(false);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    };
  }, []);

  const handleScrollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCurrentSegment(value);
    
    // 구간 이동 시 자동 재생 로직 추가
    if (isPlaying) {
      window.speechSynthesis.cancel();
      playSegmentFromIndex(value, currentRate);
    }
  };

  return (
    <div className='font-wanted'>
      
      <button
        className='w-[375px] h-[56px] p-[16px_20px]'
        onClick={handleGoHome}>
        <Image 
          src="/logo/playerlogo.svg" 
          alt="Loading Logo" 
          width={32} 
          height={32} 
        />
      </button>

      <div className='px-5'>
        <div className='h-auto max-h-[600px] overflow-y-auto'>
          <h1>{parsedText.artwork}</h1>
          <div className={`mt-1 font-normal text-[20px] leading-[32px] tracking-[-0.02em]`}>
            {segments.map((segment, index) => (
              <p
                key={index}
                ref={(el) => {
                  segmentRefs.current[index] = el;
                }}
                className={`${
                  index === currentSegment ? 'my-1 text-[#FFFFFF]' : 'm-0 text-[#FFFFFF4D]'
                }`}
              >
                {segment.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className='absolute fixed bottom-0 inset-x-0 z-10'>
        <div className='flex justify-end items-center'> {/* ReviewButtons를 버튼 그룹 옆에 배치 */}
          <ReviewButtons
            openReview={openReview}
            review={review}
            handleChooseClick={handleChooseClick}
          />

          <div className='h-[178px] p-[0px_16px_14px_20px] flex items-center'>
            <div className='flex flex-col w-[44px] h-[164px]'>
              <button className='w-[44px] h-[44px] rounded-[40px] border border-[#2C3032] p-[10px] gap-1 bg-[#151718]'>
                <Image 
                  src="/logo/pen.svg" 
                  alt="Loading Logo" 
                  width={32} 
                  height={32} 
                />
              </button>
              
              <div className='my-4 flex justify-center w-[44px] h-[44px] rounded-[40px] p-[10px] gap-1 bg-[#151718] font-semibold text-[12px]'>
                <button onClick={togglePlaybackRate}>
                  {playbackRates[rateIndex]}
                </button>
              </div>

              <button 
                onClick={handleReviewClick}
                className={isReviewClick ? 'flex justify-center items-center w-[44px] h-[44px] rounded-[40px] border border-[#2C3032] p-[10px] gap-1 bg-[#151718]' : 'flex justify-center items-center w-[44px] h-[44px] rounded-[40px] p-[10px] gap-1 bg-[#151718]'}
              >
                {isReviewClick ? 
                  <Image 
                    src="/logo/close.svg" 
                    alt="Loading Logo" 
                    width={32} 
                    height={32} 
                  />
                  :
                  <Image 
                    src="/logo/shape.svg" 
                    alt="Loading Logo" 
                    width={32} 
                    height={32} 
                  />
                }
              </button>
            </div>
          </div>
        </div>

        <div className='bg-[#0C0D0F]'>
          <input
            type="range"
            min="0"
            max={segments.length - 1}
            value={currentSegment}
            onChange={handleScrollChange}
            className="w-full h-[4px] rounded-lg appearance-none"
            style={{
              background: `linear-gradient(to right, white 0%, white ${(currentSegment / (segments.length - 1)) * 100}%, #484C52 ${(currentSegment / (segments.length - 1)) * 100}%, #484C52 100%)`,
            }}/>
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 0;
                  height: 0;
                  background-color: transparent;
                }

                input[type="range"]::-moz-range-thumb {
                  appearance: none;
                  width: 0;
                  height: 0;
                  background-color: transparent;
                }
              `}</style>

          <div className='flex justify-center items-center h-full my-2'>
            <div className='flex w-[335px] h-[55px] gap-[14px]'>
              <Image 
                src="" 
                width={54}
                height={54}
                alt="작품 이미지"
                className='w-[54px] h-[54px] rounded-[10px] blur-sm'
              />
              
              <div>
                <div className='w-[201px] h-[29px] font-semibold text-[18px] leading-[28.9px] tracking-[-1%] text-[#FFFFFF]'>
                  {parsedText.artwork}
                </div>
                <div className='w-[201px] h-[24px] font-normal text-[16px] leading-[24px]tracking-[-1%] text-[#787B83]'>
                  파블로 피카소
                </div>
              </div>
              
              <div className='mt-2'>
                <button onClick={handlePlayPause}>
                  {isPlaying ? 
                      <Image 
                      src="/button/Pausebutton.svg" 
                      alt="Loading Logo" 
                      width={32} 
                      height={32}/>
                    :
                      <Image 
                      src="/button/Playbutton.svg" 
                      alt="Loading Logo" 
                      width={32} 
                      height={32}/>
                  }
                </button>
              </div>
            </div>
          </div>

          <div className='flex justify-center items-center h-full'>
            <button 
              className='mb-7 w-[335px] h-[48px] rounded-[30px] p-[12px] gap-[8px] bg-[#1B1E1F]'
              onClick={handleGoHome}>
              새로운 작품 검색
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

TTSWithScroll.displayName = 'TTSWithScroll';  // displayName 추가
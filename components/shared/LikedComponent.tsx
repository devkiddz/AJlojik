'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

type LikedComponentProps = {
  liked: boolean;
};

export default function LikedComponent({ liked = false }: LikedComponentProps) {
  const [isLiked, setIsLiked] = useState(liked);

  const handleLike = () => {
    // if (isLiked) {
    //   setCount(prev => prev - 1);
    // } else {
    //   setCount(prev => prev + 1);
    // }

    setIsLiked(prev => !prev);
  };

  return (
    <div className="right-3 top-3 size-6 flex align-center justify-center absolute bg-white z-10 backdrop-blur-5xl shadow-lg rounded-full ">
      <button onClick={handleLike} className="flex items-center gap-1">
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        {/* <span>{count}</span> */}
      </button>
    </div>
  );
}

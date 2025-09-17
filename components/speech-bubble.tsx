'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface SpeechBubbleProps {
  message?: string
  className?: string
  delay?: number
}

export default function SpeechBubble({ 
  message = "What are you working on today?", 
  className,
  delay = 1000 
}: SpeechBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Start animation after delay
    const timer = setTimeout(() => {
      setIsAnimating(true)
      // Then make visible with smooth transition
      setTimeout(() => {
        setIsVisible(true)
      }, 50)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'relative flex justify-center mb-4 transition-all duration-700 ease-out',
        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {/* Speech bubble container */}
      <div
        className={cn(
          'relative px-4 py-3 max-w-xs transform transition-all duration-500 ease-out',
          isVisible ? 'scale-100' : 'scale-95'
        )}
      >
        {/* Main bubble */}
        <div className="relative bg-transparent border border-input rounded-2xl px-4 py-3 shadow-sm">
          {/* Message text - matches chatbar styling */}
          <p className="text-sm text-muted-foreground font-medium text-center">
            {message}
          </p>
          
          {/* Speech bubble tail pointing down */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            {/* Outer tail (border) */}
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-input"></div>
            {/* Inner tail (background) */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[1px] w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-background"></div>
          </div>
        </div>
        
        {/* Subtle animation pulse */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl border border-input/30 transition-all duration-1000',
            isVisible ? 'animate-pulse opacity-30' : 'opacity-0'
          )}
        />
      </div>
    </div>
  )
}
import { useEffect, useRef, useState } from 'react';

interface AnimatedLogoProps {
  className?: string;
}

export default function AnimatedLogo({ className = "h-12 w-12" }: AnimatedLogoProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout>();

  // ensure we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // track mouse movement globally
  useEffect(() => {
    if (!isClient) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isClient]);

  // random blink intervals
  useEffect(() => {
    if (!isClient) return;
    
    const scheduleNextBlink = () => {
      const randomDelay = Math.random() * 3000 + 2000; // 2-5 seconds
      blinkTimeoutRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 150); // blink duration
      }, randomDelay);
    };

    scheduleNextBlink();
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, [isClient]);

  // calculate eye positions based on mouse
  const calculateEyePosition = (eyeCenterX: number, eyeCenterY: number) => {
    // return default position until client-side hydration is complete
    if (!isClient) {
      return { x: eyeCenterX, y: eyeCenterY };
    }

    // get screen center
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    // calculate distance from screen center (0 to 1)
    const maxDistance = Math.sqrt(screenCenterX * screenCenterX + screenCenterY * screenCenterY);
    const currentDistance = Math.sqrt(
      Math.pow(mousePos.x - screenCenterX, 2) + Math.pow(mousePos.y - screenCenterY, 2)
    );
    const distanceRatio = Math.min(currentDistance / maxDistance, 1);

    // calculate angle from screen center to mouse
    const angle = Math.atan2(mousePos.y - screenCenterY, mousePos.x - screenCenterX);

    // move eyes proportionally (max 22 units - extends past circle edge)
    const maxMovement = 90;
    const moveDistance = distanceRatio * maxMovement;

    return {
      x: eyeCenterX + Math.cos(angle) * moveDistance,
      y: eyeCenterY + Math.sin(angle) * moveDistance
    };
  };

  const leftEyePos = calculateEyePosition(102, 128);
  const rightEyePos = calculateEyePosition(154, 128);

  return (
    <svg
      ref={svgRef}
      fill="currentColor"
      viewBox="0 0 256 256"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* background circle - matches chat interface */}
      <circle cx="128" cy="128" r="128" fill="hsl(var(--muted))" />
      
      {/* left eye */}
      <circle 
        cx={leftEyePos.x} 
        cy={leftEyePos.y} 
        r="18" 
        fill="white"
        style={{
          transform: `scaleY(${isBlinking ? 0.1 : 1})`,
          transformOrigin: `${leftEyePos.x}px ${leftEyePos.y}px`,
          transition: isBlinking 
            ? 'transform 0.08s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), cx 0.1s ease-out, cy 0.1s ease-out'
        }}
      />
      
      {/* right eye */}
      <circle 
        cx={rightEyePos.x} 
        cy={rightEyePos.y} 
        r="18" 
        fill="white"
        style={{
          transform: `scaleY(${isBlinking ? 0.1 : 1})`,
          transformOrigin: `${rightEyePos.x}px ${rightEyePos.y}px`,
          transition: isBlinking 
            ? 'transform 0.08s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), cx 0.1s ease-out, cy 0.1s ease-out'
        }}
      />
    </svg>
  );
}
import { useEffect, useRef, useState } from 'react';

interface AnimatedLogoProps {
  className?: string;
}

export default function AnimatedLogo({ className = "h-12 w-12" }: AnimatedLogoProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentEyePos, setCurrentEyePos] = useState({ 
    left: { x: 102, y: 128 }, 
    right: { x: 154, y: 128 } 
  });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();

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
        }, 120); // blink duration
      }, randomDelay);
    };

    scheduleNextBlink();
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, [isClient]);

  // calculate target eye position with aggressive center tracking
  const calculateTargetEyePosition = (eyeCenterX: number, eyeCenterY: number) => {
    if (!isClient) {
      return { x: eyeCenterX, y: eyeCenterY };
    }

    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    // calculate normalized distance from screen center (0 to 1)
    const maxDistance = Math.sqrt(screenCenterX * screenCenterX + screenCenterY * screenCenterY);
    const currentDistance = Math.sqrt(
      Math.pow(mousePos.x - screenCenterX, 2) + Math.pow(mousePos.y - screenCenterY, 2)
    );
    const normalizedDistance = Math.min(currentDistance / maxDistance, 1);

    // aggressive center tracking with exponential falloff
    const proximityFactor = Math.pow(1 - normalizedDistance, 6);
    const baseMovement = 240;
    
    // movement is more aggressive when close to center
    const adjustedMovement = baseMovement * (0.3 + proximityFactor * 0.9);

    const angle = Math.atan2(mousePos.y - screenCenterY, mousePos.x - screenCenterX);
    const moveDistance = normalizedDistance * adjustedMovement;

    return {
      x: eyeCenterX + Math.cos(angle) * moveDistance,
      y: eyeCenterY + Math.sin(angle) * moveDistance
    };
  };

  // smooth eye position interpolation
  useEffect(() => {
    if (!isClient) return;

    const animate = () => {
      const leftTarget = calculateTargetEyePosition(102, 128);
      const rightTarget = calculateTargetEyePosition(154, 128);

      setCurrentEyePos(prev => {
        const easeSpeed = 0.15; // adjust for smoother/snappier movement

        return {
          left: {
            x: prev.left.x + (leftTarget.x - prev.left.x) * easeSpeed,
            y: prev.left.y + (leftTarget.y - prev.left.y) * easeSpeed
          },
          right: {
            x: prev.right.x + (rightTarget.x - prev.right.x) * easeSpeed,
            y: prev.right.y + (rightTarget.y - prev.right.y) * easeSpeed
          }
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient, mousePos]);

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
        cx={currentEyePos.left.x} 
        cy={currentEyePos.left.y} 
        r="18" 
        fill="white"
        style={{
          transform: `scaleY(${isBlinking ? 0.1 : 1})`,
          transformOrigin: `${currentEyePos.left.x}px ${currentEyePos.left.y}px`,
          transition: isBlinking 
            ? 'transform 0.08s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'transform 0.12s cubic-bezier(0.25, 0, 0.75, 1)'
        }}
      />
      
      {/* right eye */}
      <circle 
        cx={currentEyePos.right.x} 
        cy={currentEyePos.right.y} 
        r="18" 
        fill="white"
        style={{
          transform: `scaleY(${isBlinking ? 0.1 : 1})`,
          transformOrigin: `${currentEyePos.right.x}px ${currentEyePos.right.y}px`,
          transition: isBlinking 
            ? 'transform 0.08s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'transform 0.12s cubic-bezier(0.25, 0, 0.75, 1)'
        }}
      />
    </svg>
  );
}
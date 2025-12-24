import { useEffect, useState } from 'react';

interface BreathingCircleProps {
  isActive: boolean;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export const BreathingCircle = ({ isActive }: BreathingCircleProps) => {
  const [phase, setPhase] = useState<BreathingPhase>('pause');
  const [cycleCount, setcycleCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhase('pause');
      return;
    }

    // 4-7-8 breathing pattern
    const cyclePhases: { phase: BreathingPhase; duration: number }[] = [
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold', duration: 7000 },
      { phase: 'exhale', duration: 8000 },
      { phase: 'pause', duration: 1000 },
    ];

    let phaseIndex = 0;
    let timeout: NodeJS.Timeout;

    const nextPhase = () => {
      const current = cyclePhases[phaseIndex];
      setPhase(current.phase);

      timeout = setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % cyclePhases.length;
        if (phaseIndex === 0) {
          setcycleCount((prev) => prev + 1);
        }
        nextPhase();
      }, current.duration);
    };

    nextPhase();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isActive]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Hít vào (4s)';
      case 'hold':
        return 'Giữ (7s)';
      case 'exhale':
        return 'Thở ra (8s)';
      case 'pause':
        return 'Sẵn sàng...';
      default:
        return '';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 to-blue-600';
      case 'hold':
        return 'from-purple-400 to-purple-600';
      case 'exhale':
        return 'from-green-400 to-green-600';
      case 'pause':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        
        {/* Animated breathing circle */}
        <div
          className={`
            absolute rounded-full bg-gradient-to-br ${getPhaseColor()} 
            transition-all duration-[${phase === 'inhale' ? '4000' : phase === 'hold' ? '7000' : '8000'}ms] ease-in-out
            ${phase === 'inhale' ? 'w-48 h-48' : phase === 'hold' ? 'w-48 h-48' : phase === 'exhale' ? 'w-24 h-24' : 'w-32 h-32'}
            shadow-lg
          `}
          style={{
            transitionDuration:
              phase === 'inhale'
                ? '4000ms'
                : phase === 'hold'
                ? '100ms'
                : phase === 'exhale'
                  ? '8000ms'
                  : '1000ms',
          }}
        ></div>

        {/* Center text */}
        <div className="relative z-10 text-center">
          <p className="text-2xl font-bold text-white drop-shadow-lg">
            {getPhaseText()}
          </p>
          {cycleCount > 0 && (
            <p className="text-sm text-white/80 mt-2">Chu kỳ: {cycleCount}</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center max-w-md">
        <p className="text-sm text-muted-foreground">
          {phase === 'inhale' && '🌬️ Hít vào qua mũi từ từ'}
          {phase === 'hold' && '⏸️ Giữ hơi thở'}
          {phase === 'exhale' && '💨 Thở ra qua miệng chậm rãi'}
          {phase === 'pause' && '✨ Chuẩn bị cho chu kỳ tiếp theo'}
        </p>
      </div>
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { X, Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';

interface GameModalProps {
  onClose: () => void;
}

interface Leaf {
  x: number;
  y: number;
  speed: number;
  type: 'gold' | 'maple' | 'sage';
  size: number;
  points: number;
  angle: number;
  rotSpeed: number;
}

export const GameModal: React.FC<GameModalProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const basketX = useRef(250);
  const leaves = useRef<Leaf[]>([]);
  const animFrame = useRef<number | null>(null);

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('roomforone_leaf_game_high');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {
      // ignore
    }
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setIsPlaying(true);
    leaves.current = [];
    basketX.current = 250;
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  // Update high score
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('roomforone_leaf_game_high', score.toString());
      } catch {
        // ignore
      }
    }
  }, [gameOver, score, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        basketX.current = Math.max(40, basketX.current - 25);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        basketX.current = Math.min(460, basketX.current + 25);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Mouse / Touch movement
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX;
    const scale = 500 / rect.width;
    const x = (clientX - rect.left) * scale;
    basketX.current = Math.max(40, Math.min(460, x));
  };

  // Main Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawn = 0;

    const loop = (timestamp: number) => {
      // Clear
      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(0, 0, 500, 360);

      // Spawn leaf
      if (timestamp - lastSpawn > 450) {
        lastSpawn = timestamp;
        const types: ('gold' | 'maple' | 'sage')[] = ['gold', 'maple', 'sage'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        leaves.current.push({
          x: Math.random() * 440 + 30,
          y: -10,
          speed: Math.random() * 2 + 2,
          type: chosen,
          size: chosen === 'maple' ? 18 : 14,
          points: chosen === 'maple' ? 20 : chosen === 'gold' ? 10 : 5,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
        });
      }

      // Draw and update leaves
      for (let i = leaves.current.length - 1; i >= 0; i--) {
        const leaf = leaves.current[i];
        leaf.y += leaf.speed;
        leaf.x += Math.sin(leaf.y * 0.05) * 1.5;
        leaf.angle += leaf.rotSpeed;

        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);

        ctx.fillStyle = 
          leaf.type === 'maple' ? '#C98464' :
          leaf.type === 'gold' ? '#D97706' : '#91A58C';

        // Draw leaf diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size);
        ctx.bezierCurveTo(leaf.size * 0.8, -leaf.size * 0.3, leaf.size * 0.8, leaf.size * 0.3, 0, leaf.size);
        ctx.bezierCurveTo(-leaf.size * 0.8, leaf.size * 0.3, -leaf.size * 0.8, -leaf.size * 0.3, 0, -leaf.size);
        ctx.fill();
        ctx.restore();

        // Check catch collision with basket (basket Y is at 310, width 60)
        const bx = basketX.current;
        if (leaf.y >= 300 && leaf.y <= 325 && Math.abs(leaf.x - bx) < 38) {
          setScore((s) => s + leaf.points);
          leaves.current.splice(i, 1);
          continue;
        }

        // Remove if off bottom
        if (leaf.y > 370) {
          leaves.current.splice(i, 1);
        }
      }

      // Draw Basket
      const bx = basketX.current;
      ctx.fillStyle = '#C9A47E';
      ctx.beginPath();
      ctx.roundRect(bx - 35, 310, 70, 26, [4, 4, 12, 12]);
      ctx.fill();

      // Basket woven lines
      ctx.strokeStyle = '#825E3B';
      ctx.lineWidth = 2;
      ctx.stroke();

      animFrame.current = requestAnimationFrame(loop);
    };

    animFrame.current = requestAnimationFrame(loop);

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C98464]" />
            <h3 className="text-sm font-bold text-[#34312E]">
              桌角手柄 · 秋日接落叶 (轻量小游戏)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Game Stats Bar */}
        <div className="px-6 py-2.5 bg-[#EFE8DC]/50 border-b border-[#C9A47E]/20 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-4">
            <span className="text-[#34312E]">
              得分: <strong className="text-base text-[#C98464]">{score}</strong>
            </span>
            <span className="text-[#34312E]/70">
              倒计时: <strong className="text-[#34312E]">{timeLeft}s</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#34312E]/60">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>最高纪录: {highScore}</span>
          </div>
        </div>

        {/* Game Canvas Container */}
        <div className="relative p-4 bg-[#EFE8DC]/30 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={360}
            onPointerMove={handlePointerMove}
            className="w-full max-w-[480px] h-[320px] rounded-2xl border border-[#C9A47E]/30 bg-[#FAF7F0] shadow-inner cursor-ew-resize touch-none"
          />

          {/* Overlay Start / Game Over Screen */}
          {!isPlaying && (
            <div className="absolute inset-0 m-4 rounded-2xl bg-[#FAF7F0]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              {gameOver ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <Trophy className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="text-base font-bold text-[#34312E]">时间到！</h4>
                  <p className="text-xs text-[#34312E]/70 mt-1">
                    你在 30 秒内接住了落叶，最终得分：
                    <span className="text-lg font-bold text-[#C98464] ml-1">{score}</span>
                  </p>
                  <button
                    onClick={startGame}
                    className="mt-4 flex items-center gap-2 px-5 py-2 rounded-full bg-[#C98464] hover:bg-[#B36F51] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    再玩一局
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#EFE8DC] flex items-center justify-center mb-3 text-[#C98464]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#34312E]">秋日接落叶</h4>
                  <p className="text-xs text-[#34312E]/70 mt-1 max-w-xs leading-relaxed">
                    左右移动小竹篮，在 30 秒内收集从树上飘落的落叶，放松片刻。
                  </p>
                  <button
                    onClick={startGame}
                    className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C9A47E] hover:bg-[#B58756] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    开始游戏
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-[#FAF7F0] border-t border-[#C9A47E]/15 text-[11px] text-[#34312E]/60 flex items-center justify-between">
          <span>可用键盘左右方向键 (A/D) 或触摸滑动控制竹篮</span>
          <button
            onClick={onClose}
            className="text-[#C98464] hover:underline cursor-pointer font-medium"
          >
            返回房间
          </button>
        </div>
      </div>
    </div>
  );
};

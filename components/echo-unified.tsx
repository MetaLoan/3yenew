"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { X, Music, ChevronLeft } from "lucide-react"
import { InkRevealText } from "./ink-reveal-text"
import { EchoEffect } from "./echo-effect"
import { AudioPlayer } from "./audio-player"
import type { EchoResult } from "@/lib/oracle-types"

type Phase = "choice" | "library" | "transitioning" | "playing" | "result" | "exiting"

// Echo 音频库数据
const echoLibrary = [
  {
    id: "deep-sleep",
    title: "Deep Sleep",
    subtitle: "Delta waves for restorative rest",
    frequency: "432Hz + White Noise",
    duration: "8:00",
    description: "Gentle delta wave frequencies tuned to 432Hz harmonize with your natural sleep cycle. The layered white noise masks environmental disturbances, guiding you into deep restorative sleep within minutes.",
  },
  {
    id: "focus-flow",
    title: "Focus Flow",
    subtitle: "Gamma waves for concentration",
    frequency: "40Hz Binaural",
    duration: "25:00",
    description: "40Hz gamma binaural beats enhance neural synchronization and cognitive clarity. Ideal for deep work sessions, creative problem-solving, or whenever you need laser-sharp mental focus.",
  },
  {
    id: "anxiety-shield",
    title: "Anxiety Shield",
    subtitle: "Calming frequencies",
    frequency: "528Hz + Singing Bowl",
    duration: "12:00",
    description: "The 528Hz 'miracle tone' combined with Tibetan singing bowls creates a protective sonic cocoon. Reduces cortisol levels and activates your parasympathetic nervous system for instant calm.",
  },
  {
    id: "energy-boost",
    title: "Energy Boost",
    subtitle: "Morning activation",
    frequency: "Beta Wave 15Hz",
    duration: "10:00",
    description: "Energizing beta frequencies stimulate alertness and mental clarity. Perfect for replacing your morning coffee or overcoming afternoon fatigue. Awakens body and mind naturally.",
  },
]

interface EchoUnifiedProps {
  isVisible: boolean
  recommendation: string  // 推荐理由（用于结果）
  frequency: number       // 推荐频率
  trackName: string       // 音轨名称
  isGenerating?: boolean  // 是否正在后台生成
  externalProgress?: number  // 外部传入的进度（用于恢复）
  onAccept: () => void
  onReject: () => void
  onCancel: () => void    // 取消生成
  onComplete: (result: EchoResult) => void
  onExit: () => void
}

export function EchoUnified({
  isVisible,
  recommendation,
  frequency,
  trackName,
  isGenerating = false,
  externalProgress = 0,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  onExit
}: EchoUnifiedProps) {
  const [phase, setPhase] = useState<Phase>("choice")
  const [animationState, setAnimationState] = useState<'hidden' | 'visible' | 'exiting'>('hidden')
  const [playProgress, setPlayProgress] = useState(0)
  const [generateProgress, setGenerateProgress] = useState(0) // 生成进度
  const [playCountMap, setPlayCountMap] = useState<Record<string, number>>({
    "deep-sleep": 5,
    "focus-flow": 3,
    "anxiety-shield": 1,
    "energy-boost": 0,
  })
  const timeoutsRef = useRef<number[]>([])
  const progressIntervalRef = useRef<number | null>(null)
  const generateIntervalRef = useRef<number | null>(null)

  const PLAY_DURATION = 30 // 播放时长（秒）
  const GENERATE_DURATION = 20 // 生成时长（秒）

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  const clearScheduled = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (generateIntervalRef.current) {
      window.clearInterval(generateIntervalRef.current)
      generateIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      // 仅在弹窗从不可见变为可见时初始化状态
      if (animationState === 'hidden') {
        clearScheduled()
        // 如果正在后台生成，恢复到 transitioning 状态
        if (isGenerating) {
          setPhase("transitioning")
          setGenerateProgress(externalProgress)
        } else {
          setPhase("choice")
          setGenerateProgress(0)
        }
        setPlayProgress(0)
        setAnimationState('hidden')
        schedule(() => setAnimationState('visible'), 50)
      }
    } else {
      setAnimationState('hidden')
      clearScheduled()
    }
  }, [isVisible, isGenerating, clearScheduled, schedule])

  // 同步外部进度（当后台生成进度更新时），不触发重置动画
  useEffect(() => {
    if (isGenerating && phase === "transitioning") {
      setGenerateProgress(externalProgress)
    }
  }, [externalProgress, isGenerating, phase])

  const handleAccept = useCallback(() => {
    setPhase("transitioning")
    onAccept()  // 通知父组件开始后台生成（父组件会控制进度和完成时机）
    // 进度由父组件通过 externalProgress 传入，不再在这里追踪
  }, [onAccept])

  const handleReject = useCallback(() => {
    setAnimationState('exiting')
    schedule(() => onReject(), 500)
  }, [onReject, schedule])

  const handleExit = useCallback(() => {
    clearScheduled()
    setPhase("exiting")
    schedule(() => onExit(), 500)
  }, [onExit, schedule, clearScheduled])

  const handleComplete = useCallback(() => {
    setPhase("exiting")
    const result: EchoResult = {
      frequency,
      duration: PLAY_DURATION,
      trackName,
      purpose: "磁场调整",
      recommendation
    }
    schedule(() => onComplete(result), 800)
  }, [frequency, trackName, recommendation, onComplete, schedule])

  const handleShowLibrary = useCallback(() => {
    setPhase("library")
  }, [])

  const handleViewLater = useCallback(() => {
    // 稍后查看 - 关闭弹窗，但不清除生成进度（让后台继续生成）
    setAnimationState('exiting')
    schedule(() => onExit(), 500)
    // 注意：不调用 clearScheduled()，让 generateIntervalRef 继续运行
  }, [schedule, onExit])

  const handleCancel = useCallback(() => {
    // 取消生成 - 关闭弹窗并清除所有进度
    clearScheduled()
    setAnimationState('exiting')
    schedule(() => onCancel(), 500)
  }, [clearScheduled, schedule, onCancel])

  const handleBackToChoice = useCallback(() => {
    setPhase("choice")
    setAnimationState('visible') // 确保返回时内容可见
  }, [])

  const handlePlayComplete = useCallback((audioId: string) => {
    setPlayCountMap((prev) => ({
      ...prev,
      [audioId]: Math.min((prev[audioId] || 0) + 1, 5),
    }))
  }, [])

  // 不渲染但保持组件挂载
  if (!isVisible) return null

  const isChoicePhase = phase === "choice"
  const isTransitioning = phase === "transitioning"
  const isChoiceOrTransitioning = isChoicePhase || isTransitioning
  const isLibraryPhase = phase === "library"
  const isPlaying = phase === "playing"
  const isResult = phase === "result"

  return (
    <div className={`fixed z-[100] inset-0 transition-all duration-1000 ${phase === "exiting" ? "opacity-0" : "opacity-100"} pointer-events-none`}>
      {/* 背景层 */}
      <div 
        className={`absolute left-0 right-0 transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) ${(isChoiceOrTransitioning || isLibraryPhase) ? "bg-background/80 backdrop-blur-md" : "bg-background"}`}
        style={{
          bottom: (isChoiceOrTransitioning || isLibraryPhase) ? "64px" : "0",
          top: isLibraryPhase ? "0" : (isChoiceOrTransitioning ? "calc(100% - 384px)" : "0"),
          maskImage: isChoiceOrTransitioning ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)" : "none",
          WebkitMaskImage: isChoiceOrTransitioning ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)" : "none",
          pointerEvents: (isChoiceOrTransitioning && !isLibraryPhase) ? "none" : "auto",
        }}
      />

      {/* 关闭按钮 */}
      {(isPlaying || isResult || isLibraryPhase) && (
        <button 
          onClick={isLibraryPhase ? handleBackToChoice : handleExit} 
          className="absolute top-6 right-6 z-[110] p-2 border-[0.5px] border-foreground/30 bg-transparent hover:bg-foreground/10 transition-colors pointer-events-auto"
        >
          {isLibraryPhase ? <ChevronLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      )}

      {/* 音频库页面 */}
      {isLibraryPhase && (
        <div 
          className="absolute inset-0 overflow-y-auto pointer-events-auto"
          style={{
            paddingTop: "80px",
            paddingBottom: "100px",
          }}
        >
          <div className="px-6 max-w-screen-lg mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-light mb-2">
                <InkRevealText text="Echo" />
              </h1>
              <p className="text-sm opacity-60 font-light">
                <InkRevealText text="Soul resonance & healing frequencies" />
              </p>
            </div>

            <section className="space-y-3">
              {echoLibrary.map((audio) => (
                <AudioPlayer 
                  key={audio.id} 
                  {...audio} 
                  playCount={playCountMap[audio.id] || 0}
                  onPlayComplete={() => handlePlayComplete(audio.id)}
                />
              ))}
            </section>
          </div>
        </div>
      )}

      {/* 主内容区域 - 选择阶段和播放阶段 */}
      {!isLibraryPhase && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            transform: isChoiceOrTransitioning ? "translateY(calc(50vh - 224px - 40px))" : "translateY(0)", 
            opacity: (animationState === 'visible' || !isChoiceOrTransitioning) ? 1 : 0,
            filter: (animationState === 'visible' || !isChoiceOrTransitioning) ? 'blur(0px)' : 'blur(10px)',
            transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out, filter 0.8s ease-out",
            willChange: "transform, opacity, filter",
          }}
        >
          {/* 涟漪特效区域 */}
          <div 
            className="relative pointer-events-auto"
            style={{
              transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out",
              opacity: phase === "exiting" ? 0 : 1,
              transform: isChoiceOrTransitioning ? "scale(0.5)" : "scale(1)",
              zIndex: 20,
              width: isChoiceOrTransitioning ? '200px' : '100%',
              height: isChoiceOrTransitioning ? '200px' : '100%',
              maxWidth: isChoiceOrTransitioning ? '200px' : '400px',
              maxHeight: isChoiceOrTransitioning ? '200px' : '400px',
            }}
          >
            <EchoEffect isPlaying={isPlaying || isChoiceOrTransitioning} />
          </div>

          {/* 选择阶段：标题 + 按钮 */}
          {(isChoicePhase || phase === "transitioning") && (
            <div 
              className="absolute w-full flex flex-col items-center pointer-events-none px-6" 
              style={{ top: "calc(50% + 60px)", opacity: animationState === 'visible' ? 1 : 0 }}
            >
              <h3 className="text-lg font-light tracking-wide mb-4">
                <InkRevealText text="是否进入 Echo 调频" />
              </h3>
              
              {/* 生成中状态 - 合并按钮显示进度，镭射彩色填充 */}
              {phase === "transitioning" ? (
                <div className="flex gap-4 pointer-events-auto">
                  <button 
                    disabled
                    className="relative w-48 py-3 text-sm font-light border-[0.5px] border-foreground bg-background text-foreground cursor-wait overflow-hidden"
                  >
                    {/* 镭射彩色进度填充层 */}
                    <div 
                      className="absolute inset-0 z-0"
                      style={{
                        background: `linear-gradient(
                          90deg,
                          #ff6b6b 0%,
                          #feca57 15%,
                          #48dbfb 30%,
                          #ff9ff3 45%,
                          #54a0ff 60%,
                          #5f27cd 75%,
                          #ff6b6b 90%,
                          #feca57 100%
                        )`,
                        backgroundSize: '200% 100%',
                        animation: 'holographic-shift 2s linear infinite',
                        width: `${generateProgress}%`,
                        transition: 'width 0.1s ease-out',
                      }}
                    />
                    {/* 文字层 */}
                    <span className="relative z-10 mix-blend-difference text-white">
                      Generating - {generateProgress}%
                    </span>
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="w-16 py-3 text-sm font-light border-[0.5px] border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex gap-4 pointer-events-auto">
                  <button 
                    onClick={handleAccept} 
                    className="w-32 py-3 text-sm font-light border-[0.5px] border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    接受
                  </button>
                  <button 
                    onClick={handleReject} 
                    className="w-32 py-3 text-sm font-light border-[0.5px] border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
                  >
                    拒绝
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 播放进度条 */}
      {isPlaying && (
        <div className="fixed bottom-32 left-0 right-0 flex flex-col items-center pointer-events-none z-[110] px-12">
          <div className="w-full max-w-md">
            <div className="h-[2px] bg-foreground/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-foreground/40 transition-all duration-100"
                style={{ width: `${playProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-foreground/40">
              <span>{Math.floor(playProgress * PLAY_DURATION)}s</span>
              <span>{PLAY_DURATION}s</span>
            </div>
          </div>
          <p className="text-xs text-foreground/50 mt-4 tracking-widest">
            {trackName} · {frequency}Hz
          </p>
        </div>
      )}

      {/* 底部按钮 - 固定在底部安全区域 */}
      {(isChoicePhase || phase === "transitioning") && (
        <div 
          className="fixed left-0 right-0 flex justify-center z-[110]"
          style={{ 
            bottom: "79px",
            opacity: animationState === 'visible' ? 1 : 0,
            transition: "opacity 0.8s ease-out",
          }}
        >
          <button 
            onClick={phase === "transitioning" ? handleViewLater : handleShowLibrary}
            className="flex items-center gap-2 px-6 py-2 text-xs text-foreground/60 hover:text-foreground transition-colors pointer-events-auto"
          >
            <Music className="w-4 h-4" />
            <span>{phase === "transitioning" ? "稍后在 Echo 中查看" : "查看所有历史 Echo"}</span>
          </button>
        </div>
      )}

      {/* 结果页面 */}
      {isResult && (
        <div 
          className="fixed bottom-32 left-0 right-0 flex flex-col items-center pointer-events-none z-[110] px-6"
          style={{
            opacity: 1,
            transition: "opacity 0.8s ease-out",
          }}
        >
          <InkRevealText text="磁场调整完成" className="text-xl font-light mb-4" />
          <p className="text-xs text-foreground/60 max-w-md text-center leading-relaxed mb-6">
            {frequency}Hz 频率已帮助你调整当前能量场，建议保持平静状态片刻
          </p>
          <button 
            onClick={handleComplete} 
            className="px-12 py-3 text-sm font-light border-[0.5px] border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors pointer-events-auto"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

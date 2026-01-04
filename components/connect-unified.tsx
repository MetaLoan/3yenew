"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { X, ChevronLeft, ChevronRight, Plus, Camera, RefreshCw, Scan, CheckCircle2 } from "lucide-react"
import { InkRevealText } from "./ink-reveal-text"
import { SolarSystem } from "./solar-system"
import { OracleInteractiveEye } from "./oracle-interactive-eye"
import { cn } from "@/lib/utils"

type Phase = "choice" | "creating" | "editing" | "resonating" | "doorOpening" | "result" | "exiting"
type SelectionStep = "first" | "second"

interface UserOrb {
  id: string
  name: string
  gender: string
  birthday: string
  soul: string
  blood: string
}

interface ConnectUnifiedProps {
  isVisible: boolean
  onAccept: () => void
  onReject: () => void
  onComplete: (result: any) => void
  onExit: () => void
}

// 模拟用户数据
const mockUsers: UserOrb[] = [
  { id: "1", name: "Leo", gender: "男", birthday: "1990-08-15", soul: "SOUL-A1B2C3D4-XY12", blood: "O" },
  { id: "2", name: "Luna", gender: "女", birthday: "1995-03-22", soul: "", blood: "A" },
  { id: "3", name: "Nova", gender: "", birthday: "1988-11-11", soul: "", blood: "" },
  { id: "4", name: "Aria", gender: "", birthday: "", soul: "", blood: "" },
]

// 法阵节点位置
const ringPositions = Array.from({ length: 5 }, (_, index) => {
  const angleDeg = -90 + index * (360 / 5)
  const angleRad = (angleDeg * Math.PI) / 180
  const radius = 32
  const x = 50 + radius * Math.cos(angleRad)
  const y = 50 + radius * Math.sin(angleRad)
  return { top: `${y}%`, left: `${x}%`, x, y }
})

const starOrder = [0, 2, 4, 1, 3]
const starPoints = starOrder.map((index) => `${ringPositions[index].x},${ringPositions[index].y}`).join(" ")

// 自定义十二星座线性图标组件
const ZodiacIcons = {
  Aries: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21c0-4.5 0-9 0-9m0 0c0-3 2-5 5-5s5 2 5 5m-10 0c0-3-2-5-5-5s-5 2-5 5" />
    </svg>
  ),
  Taurus: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="14" r="6" />
      <path d="M5 4c1 4 3 6 7 6s6-2 7-6" />
    </svg>
  ),
  Gemini: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2m10-16a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2M4 4h16M4 20h16" />
    </svg>
  ),
  Cancer: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="16" cy="7" r="3" />
      <circle cx="8" cy="17" r="3" />
      <path d="M19 10c-3 0-6 2-7 5m-7-3c3 0 6-2 7-5" />
    </svg>
  ),
  Leo: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="17" r="3" />
      <path d="M8.5 15c1-3 4-5 7-3s3 5 0 8m0-13c2 0 4 2 4 4s-2 4-4 4" />
    </svg>
  ),
  Virgo: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4v12a3 3 0 0 0 6 0V4m0 12a3 3 0 0 0 6 0V4m0 12c0 2 1 4 3 4" />
      <path d="M11 4h1m-7 0h1" />
    </svg>
  ),
  Libra: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 20h14M5 16h14m-7-4c-3 0-5-2-5-5h10c0 3-2 5-5 5z" />
    </svg>
  ),
  Scorpio: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4v10a2 2 0 0 0 4 0V4m0 10a2 2 0 0 0 4 0V4m0 10a2 2 0 0 0 4 0m0 0c0 2 1 3 3 3" />
      <path d="M17 17l2 2m-2 0l2-2" />
    </svg>
  ),
  Sagittarius: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20L20 4m0 0h-7m7 0v7M7 13l4 4" />
    </svg>
  ),
  Capricorn: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5l4 14 4-8c1-2 4-2 4 0s-2 6-2 8 2 2 4 0" />
    </svg>
  ),
  Aquarius: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10l3-3 4 4 3-3 4 4 2-2M4 17l3-3 4 4 3-3 4 4 2-2" />
    </svg>
  ),
  Pisces: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12c5 0 8-3 8-8m0 16c0-5 3-8 8-8M12 4v16m-8 0c0-5 3-8 8-8m0 0c5 0 8 3 8 8" />
    </svg>
  ),
}

// 星座数据
const zodiacSigns = [
  { name: "Capricorn", icon: ZodiacIcons.Capricorn, start: [1, 1], end: [1, 19] },
  { name: "Aquarius", icon: ZodiacIcons.Aquarius, start: [1, 20], end: [2, 18] },
  { name: "Pisces", icon: ZodiacIcons.Pisces, start: [2, 19], end: [3, 20] },
  { name: "Aries", icon: ZodiacIcons.Aries, start: [3, 21], end: [4, 19] },
  { name: "Taurus", icon: ZodiacIcons.Taurus, start: [4, 20], end: [5, 20] },
  { name: "Gemini", icon: ZodiacIcons.Gemini, start: [5, 21], end: [6, 20] },
  { name: "Cancer", icon: ZodiacIcons.Cancer, start: [6, 21], end: [7, 22] },
  { name: "Leo", icon: ZodiacIcons.Leo, start: [7, 23], end: [8, 22] },
  { name: "Virgo", icon: ZodiacIcons.Virgo, start: [8, 23], end: [9, 22] },
  { name: "Libra", icon: ZodiacIcons.Libra, start: [9, 23], end: [10, 22] },
  { name: "Scorpio", icon: ZodiacIcons.Scorpio, start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", icon: ZodiacIcons.Sagittarius, start: [11, 22], end: [12, 21] },
  { name: "Capricorn", icon: ZodiacIcons.Capricorn, start: [12, 22], end: [12, 31] },
]

function getZodiacFromBirthday(birthday: string): { name: string; icon: any } | null {
  if (!birthday) return null
  const date = new Date(birthday)
  if (isNaN(date.getTime())) return null
  
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start
    const [endMonth, endDay] = sign.end
    
    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) {
        return { name: sign.name, icon: sign.icon }
      }
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return { name: sign.name, icon: sign.icon }
      }
    }
  }
  return null
}

// Material Symbol 图标组件
const MaterialIcon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span 
    className={cn("material-symbols-outlined transition-opacity duration-300", className)}
    style={{ 
      fontSize: '26px',
      color: 'inherit',
      fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24"
    }}
  >
    {name}
  </span>
)

// 节点配置
const nodeConfigs = [
  { label: "姓名", field: "name", icon: "person" },
  { label: "性别", field: "gender", icon: "person_2" },
  { label: "生日", field: "birthday", icon: "calendar_today" },
  { label: "灵魂", field: "soul", icon: "visibility_off" },
  { label: "血型", field: "blood", icon: "water_drop" },
]

// ==================== EyeScanner 组件 ====================
function EyeScanner({ onCapture }: { onCapture: (code: string, image: string) => void }) {
  const [isStarted, setIsStarted] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<string>("IDLE")
  const [eyePositions, setEyePositions] = useState<{ left: { x: number, y: number }, right: { x: number, y: number } } | null>(null)
  const [capturePhase, setCapturePhase] = useState<number>(-1)
  const capturePhaseRef = useRef<number>(-1)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedEyePositions, setCapturedEyePositions] = useState<{ left: { x: number, y: number }, right: { x: number, y: number } } | null>(null)
  const [soulCode, setSoulCode] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceMeshRef = useRef<any>(null)
  const requestRef = useRef<number | null>(null)
  const isActiveRef = useRef(false)
  const eyeDetectedRef = useRef(false)

  const ritualPhrases = [
    "正在透过灵魂之门凝视...",
    "解读虹膜中的远古图案...",
    "解码你本质的星象印记...",
    "感应你存在的以太频率...",
    "捕捉你内在宇宙的无限深度..."
  ]

  const waitingMessage = "等待你的凝视... 请让我看到你的双眼正视镜头。"

  const LEFT_IRIS_CENTER = 468
  const RIGHT_IRIS_CENTER = 473

  useEffect(() => {
    capturePhaseRef.current = capturePhase
  }, [capturePhase])

  useEffect(() => {
    if (!eyeDetectedRef.current || capturePhase < 0 || capturePhase >= ritualPhrases.length || capturedImage) {
      return
    }

    const timer = setTimeout(() => {
      if (eyeDetectedRef.current) {
        const nextPhase = capturePhase + 1
        if (nextPhase < ritualPhrases.length) {
          setCapturePhase(nextPhase)
        } else {
          performCapture()
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [capturePhase, capturedImage])

  const waitForLibs = async (maxRetries = 30): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
      const fm = (window as any).FaceMesh
      if (fm) return true
      await new Promise(r => setTimeout(r, 300))
      setLoadingStatus(`初始化视觉核心 (${i + 1}/${maxRetries})`)
    }
    return false
  }

  const loadMediaPipeScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).FaceMesh) {
        resolve()
        return
      }
      
      const cameraScript = document.createElement('script')
      cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
      cameraScript.crossOrigin = 'anonymous'
      document.head.appendChild(cameraScript)
      
      const drawingScript = document.createElement('script')
      drawingScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'
      drawingScript.crossOrigin = 'anonymous'
      document.head.appendChild(drawingScript)
      
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
      script.crossOrigin = 'anonymous'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load MediaPipe'))
      document.head.appendChild(script)
    })
  }

  const performCapture = () => {
    if (!videoRef.current) return
    
    const video = videoRef.current
    const vw = video.videoWidth
    const vh = video.videoHeight
    
    let minX = 0, maxX = vw, minY = 0, maxY = vh
    
    if (eyePositions && eyePositions.left && eyePositions.right) {
      const leftEyeX = (eyePositions.left.x / 100) * vw
      const leftEyeY = (eyePositions.left.y / 100) * vh
      const rightEyeX = (eyePositions.right.x / 100) * vw
      const rightEyeY = (eyePositions.right.y / 100) * vh
      
      const paddingX = vw * 0.15
      const paddingY = vh * 0.08
      
      minX = Math.max(0, Math.min(leftEyeX, rightEyeX) - paddingX)
      maxX = Math.min(vw, Math.max(leftEyeX, rightEyeX) + paddingX)
      minY = Math.max(0, Math.min(leftEyeY, rightEyeY) - paddingY)
      maxY = Math.min(vh, Math.max(leftEyeY, rightEyeY) + paddingY)
    } else {
      const centerX = vw / 2
      const centerY = vh / 2
      const cropW = vw * 0.6
      const cropH = vh * 0.3
      minX = centerX - cropW / 2
      maxX = centerX + cropW / 2
      minY = centerY - cropH / 2
      maxY = centerY + cropH / 2
    }
    
    const cropWidth = Math.round(maxX - minX)
    const cropHeight = Math.round(maxY - minY)
    
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = cropWidth
    tempCanvas.height = cropHeight
    const tempCtx = tempCanvas.getContext('2d')
    
    if (tempCtx) {
      tempCtx.translate(cropWidth, 0)
      tempCtx.scale(-1, 1)
      
      tempCtx.drawImage(
        video,
        Math.round(minX), Math.round(minY), cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      )
      
      const croppedImageData = tempCanvas.toDataURL('image/jpeg', 0.95)
      setCapturedImage(croppedImageData)
      
      const hash = croppedImageData.length.toString(16).toUpperCase().slice(-8)
      const code = `SOUL-${hash}-${Date.now().toString(36).toUpperCase().slice(-4)}`
      setSoulCode(code)
      
      onCapture(code, croppedImageData)
      stopCamera()
    }
  }

  const startCamera = async () => {
    setIsStarted(true)
    setLoadingStatus("加载视觉组件...")
    
    try {
      await loadMediaPipeScript()
      
      const libsReady = await waitForLibs()
      if (!libsReady) {
        throw new Error("MEDIAPIPE_LIBS_NOT_FOUND")
      }

      setLoadingStatus("连接摄像头...")
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      })
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      
      setHasPermission(true)
      
      setLoadingStatus("初始化神经网络...")
      const FaceMesh = (window as any).FaceMesh
      const faceMesh = new FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      })
      
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })
      
      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0]
          const leftEye = landmarks[LEFT_IRIS_CENTER]
          const rightEye = landmarks[RIGHT_IRIS_CENTER]
          
          if (leftEye && rightEye) {
            const newPositions = {
              left: { x: leftEye.x * 100, y: leftEye.y * 100 },
              right: { x: rightEye.x * 100, y: rightEye.y * 100 }
            }
            setEyePositions(newPositions)
            
            if (!eyeDetectedRef.current && capturePhase < 0 && !capturedImage) {
              eyeDetectedRef.current = true
              setCapturePhase(0)
            } else {
              eyeDetectedRef.current = true
            }
          } else {
            handleEyesLost()
          }
        } else {
          handleEyesLost()
        }
        
        renderFrame(results)
        
        if (loadingStatus !== "READY") {
          setLoadingStatus("READY")
        }
      })
      
      faceMeshRef.current = faceMesh
      isActiveRef.current = true
      
      const processFrame = async () => {
        if (!isActiveRef.current || !videoRef.current || videoRef.current.paused) {
          requestRef.current = requestAnimationFrame(processFrame)
          return
        }
        
        try {
          await faceMeshRef.current.send({ image: videoRef.current })
        } catch (e) {
          console.error("Frame processing error:", e)
        }
        
        requestRef.current = requestAnimationFrame(processFrame)
      }
      
      requestRef.current = requestAnimationFrame(processFrame)
      
    } catch (err) {
      console.error("Camera/MediaPipe initialization failed:", err)
      setHasPermission(false)
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        alert("摄像头权限被拒绝。请在浏览器设置中启用并刷新页面。")
      }
    }
  }

  const handleEyesLost = () => {
    setEyePositions(null)
    eyeDetectedRef.current = false
    if (capturePhase >= 0 && capturePhase < ritualPhrases.length) {
      setCapturePhase(-1)
    }
  }
  
  const renderFrame = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    const cw = canvasRef.current.width
    const ch = canvasRef.current.height
    
    ctx.clearRect(0, 0, cw, ch)
    
    ctx.save()
    ctx.filter = 'blur(15px) brightness(0.3)'
    ctx.scale(-1, 1)
    ctx.drawImage(videoRef.current, -cw, 0, cw, ch)
    ctx.restore()
    
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0]
      const leftEye = landmarks[LEFT_IRIS_CENTER]
      const rightEye = landmarks[RIGHT_IRIS_CENTER]
      
      if (leftEye && rightEye) {
        ctx.save()
        
        ctx.beginPath()
        
        const leftX = cw - (leftEye.x * cw)
        const leftY = leftEye.y * ch
        ctx.ellipse(leftX, leftY, 50, 35, 0, 0, Math.PI * 2)
        
        const rightX = cw - (rightEye.x * cw)
        const rightY = rightEye.y * ch
        ctx.ellipse(rightX, rightY, 50, 35, 0, 0, Math.PI * 2)
        
        ctx.clip()
        
        ctx.filter = 'none'
        ctx.scale(-1, 1)
        ctx.drawImage(videoRef.current, -cw, 0, cw, ch)
        
        ctx.restore()
        
        const currentPhase = capturePhaseRef.current
        const progress = currentPhase >= 0 ? (currentPhase + 1) / ritualPhrases.length : 0
        drawEyeProgressRing(ctx, leftEye, cw, ch, progress)
        drawEyeProgressRing(ctx, rightEye, cw, ch, progress)
      }
    }
  }
  
  const drawEyeProgressRing = (ctx: CanvasRenderingContext2D, eyeCenter: any, cw: number, ch: number, progress: number) => {
    if (!eyeCenter) return
    
    const x = cw - (eyeCenter.x * cw)
    const y = eyeCenter.y * ch
    const r = 17
    const lineWidth = 3
    const time = Date.now()
    const segments = 5
    const gapAngle = 0.08
    const segmentAngle = (Math.PI * 2 - gapAngle * segments) / segments
    const startOffset = -Math.PI / 2
    
    ctx.save()
    
    for (let i = 0; i < segments; i++) {
      const segmentStart = startOffset + i * (segmentAngle + gapAngle)
      const segmentEnd = segmentStart + segmentAngle
      const isLit = (i + 1) / segments <= progress
      const isCurrentSegment = i === Math.floor(progress * segments) && progress < 1
      
      ctx.beginPath()
      ctx.arc(x, y, r, segmentStart, segmentEnd)
      ctx.lineCap = 'round'
      ctx.lineWidth = lineWidth
      
      if (isLit) {
        const gradient = ctx.createLinearGradient(
          x + Math.cos(segmentStart) * r,
          y + Math.sin(segmentStart) * r,
          x + Math.cos(segmentEnd) * r,
          y + Math.sin(segmentEnd) * r
        )
        gradient.addColorStop(0, '#00ff88')
        gradient.addColorStop(1, '#00ffff')
        
        ctx.strokeStyle = gradient
        ctx.shadowBlur = 10
        ctx.shadowColor = '#00ffff'
        ctx.stroke()
        
        ctx.shadowBlur = 40
        ctx.shadowColor = '#00ff88'
        ctx.globalAlpha = 0.4
        ctx.stroke()
        ctx.globalAlpha = 1
      } else if (isCurrentSegment) {
        const segmentProgress = (progress * segments) % 1
        const partialEnd = segmentStart + segmentAngle * segmentProgress
        
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)'
        ctx.shadowBlur = 0
        ctx.stroke()
        
        ctx.beginPath()
        ctx.arc(x, y, r, segmentStart, partialEnd)
        ctx.strokeStyle = '#00ffff'
        ctx.shadowBlur = 8
        ctx.shadowColor = '#00ffff'
        ctx.stroke()
      } else {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)'
        ctx.shadowBlur = 0
        ctx.stroke()
      }
      
      ctx.shadowBlur = 0
    }
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.shadowBlur = 8
    ctx.shadowColor = '#00ffff'
    ctx.beginPath()
    ctx.arc(x, y, r + 5, 0, Math.PI * 2)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.arc(x, y, r - 5, 0, Math.PI * 2)
    ctx.stroke()
    
    ctx.shadowBlur = 15
    ctx.shadowColor = '#00ffff'
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'
    ctx.lineWidth = 2
    const scanAngle = (time / 600) % (Math.PI * 2)
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(scanAngle) * (r - 20), y + Math.sin(scanAngle) * (r - 20))
    ctx.lineTo(x + Math.cos(scanAngle) * (r + 20), y + Math.sin(scanAngle) * (r + 20))
    ctx.stroke()
    
    const pulseScale = 1 + Math.sin(time / 250) * 0.4
    ctx.shadowBlur = 12
    ctx.shadowColor = progress >= 1 ? '#00ff88' : '#00ffff'
    ctx.fillStyle = progress >= 1 ? '#00ff88' : '#00ffff'
    ctx.beginPath()
    ctx.arc(x, y, 2 * pulseScale, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.shadowBlur = 15
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'center'
    if (progress < 1) {
      ctx.fillStyle = '#00ffff'
      ctx.shadowColor = '#00ffff'
      ctx.fillText(`${Math.round(progress * 100)}%`, x, y + r + 30)
    } else {
      ctx.fillStyle = '#00ff88'
      ctx.shadowColor = '#00ff88'
      ctx.fillText('已捕获', x, y + r + 30)
    }
    
    ctx.restore()
  }

  const stopCamera = () => {
    isActiveRef.current = false
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (faceMeshRef.current) {
      try { faceMeshRef.current.close() } catch(e) {}
      faceMeshRef.current = null
    }
    setIsStarted(false)
    setEyePositions(null)
    setLoadingStatus("IDLE")
    setCapturePhase(-1)
    setCapturedImage(null)
    setCapturedEyePositions(null)
    setSoulCode(null)
    eyeDetectedRef.current = false
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border hairline border-foreground/20 bg-foreground/5 text-center">
        <Camera className="w-8 h-8 mb-3 opacity-20" />
        <p className="text-xs text-foreground font-normal">需要摄像头权限来捕捉你的灵魂印记</p>
        <button 
          onClick={startCamera}
          className="mt-4 px-4 py-2 text-[10px] tracking-widest border hairline border-foreground hover:bg-foreground hover:text-background transition-colors"
        >
          启用摄像头
        </button>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <button 
        onClick={startCamera}
        className="w-full aspect-square flex flex-col items-center justify-center border hairline border-foreground/20 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-all group"
      >
        <div className="relative mb-4">
          <Scan className="w-10 h-10 opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 border border-foreground/20 scale-150 rounded-full animate-pulse" />
        </div>
        <span className="text-[10px] tracking-[0.2em] text-foreground font-normal">启动灵魂共振</span>
      </button>
    )
  }

  const isReady = loadingStatus === "READY"

  if (capturedImage && capturePhase === 5) {
    const leftEyeX = capturedEyePositions ? (100 - capturedEyePositions.left.x) : 35
    const leftEyeY = capturedEyePositions ? capturedEyePositions.left.y : 45
    const rightEyeX = capturedEyePositions ? (100 - capturedEyePositions.right.x) : 65
    const rightEyeY = capturedEyePositions ? capturedEyePositions.right.y : 45
    
    return (
      <div className="relative aspect-square overflow-hidden border hairline border-foreground bg-black">
        <svg width="0" height="0" className="absolute">
          <defs>
            <clipPath id="eyesClipPath" clipPathUnits="objectBoundingBox">
              <ellipse cx={leftEyeX / 100} cy={leftEyeY / 100} rx="0.12" ry="0.08" />
              <ellipse cx={rightEyeX / 100} cy={rightEyeY / 100} rx="0.12" ry="0.08" />
            </clipPath>
          </defs>
        </svg>
        
        <img 
          src={capturedImage} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'blur(20px) brightness(0.25)',
            transform: 'scale(1.1)'
          }}
        />
        
        <img 
          src={capturedImage} 
          alt="Eyes revealed" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            clipPath: 'url(#eyesClipPath)'
          }}
        />
        
        <div 
          className="absolute border border-[#00ffff]/50 rounded-[50%]"
          style={{
            left: `${leftEyeX}%`,
            top: `${leftEyeY}%`,
            width: '24%',
            height: '16%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 40px 10px rgba(0,255,255,0.2), inset 0 0 30px rgba(0,255,255,0.1)'
          }}
        />
        <div 
          className="absolute border border-[#00ffff]/50 rounded-[50%]"
          style={{
            left: `${rightEyeX}%`,
            top: `${rightEyeY}%`,
            width: '24%',
            height: '16%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 40px 10px rgba(0,255,255,0.2), inset 0 0 30px rgba(0,255,255,0.1)'
          }}
        />
        
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)'
          }}
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center px-6 animate-pulse">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#00ffff]/80 mb-2">灵魂印记已捕获</p>
            <p className="text-[#00ffff] font-mono text-sm tracking-wider mb-4">{soulCode}</p>
            <p className="text-[10px] text-white/40">保存中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-square overflow-hidden border hairline border-foreground bg-black">
      <video 
        ref={videoRef} 
        className="hidden"
        playsInline 
        muted
        autoPlay
      />
      <canvas 
        ref={canvasRef} 
        width={480} 
        height={480} 
        className="w-full h-full object-cover"
      />
      
      {!isReady && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4 z-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-foreground/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground/60 font-mono text-[10px] tracking-widest animate-pulse">{loadingStatus}</p>
        </div>
      )}
      
      {isReady && (
        <div className="absolute inset-0 pointer-events-none flex flex-col">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${eyePositions ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="text-[9px] text-white/60 font-mono uppercase tracking-widest">
              {eyePositions ? '虹膜锁定' : '搜索中'}
            </span>
          </div>
          
          <div className="flex-1 flex items-end justify-center pb-16 px-6">
            <div className="text-center max-w-xs">
              {eyePositions && capturePhase >= 0 && capturePhase < ritualPhrases.length ? (
                <p 
                  key={capturePhase}
                  className="text-white/90 text-sm font-light italic leading-relaxed animate-fade-in"
                >
                  {ritualPhrases[capturePhase]}
                </p>
              ) : !eyePositions ? (
                <p className="text-white/60 text-xs font-light leading-relaxed">
                  {waitingMessage}
                </p>
              ) : null}
              
              {eyePositions && capturePhase >= 0 && capturePhase < ritualPhrases.length && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {ritualPhrases.map((_, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                        idx <= capturePhase ? "bg-white" : "bg-white/20"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isReady && (
        <button 
          onClick={stopCamera}
          className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur rounded-full hover:bg-background transition-colors pointer-events-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// ==================== 轨道节点组件 ====================
function OrbitalNode({
  config,
  position,
  value,
  onSelect,
}: {
  config: typeof nodeConfigs[0]
  position: { top: string; left: string }
  value: string
  onSelect: () => void
}) {
  const filled = Boolean(value)
  const display = value || config.label
  
  // 根据字段和值动态选择图标
  let iconName = config.icon
  let ZodiacIcon: any = null
  
  if (config.field === "soul" && value) {
    iconName = "visibility" // 已捕获显示睁眼
  } else if (config.field === "gender" && value) {
    if (value === "女") iconName = "female"
    else if (value === "男") iconName = "male"
    else iconName = "transgender"
  } else if (config.field === "birthday" && value) {
    const zodiac = getZodiacFromBirthday(value)
    if (zodiac) {
      ZodiacIcon = zodiac.icon
    }
  }

  return (
    <div
      className="absolute transition-all duration-500 ease-out"
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, -50%)",
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-col items-center text-[10px] tracking-[0.18em] transition-all duration-500 ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-foreground/60 group"
        aria-label={display}
      >
        <div
          className={cn(
            "flex items-center justify-center w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full border border-foreground bg-background shadow-[0_0_8px_rgba(0,0,0,0.04)] transition-all duration-300",
            filled 
              ? "bg-foreground text-background" 
              : "hover:bg-foreground hover:text-background hover:shadow-[0_0_12px_rgba(0,0,0,0.1)]",
          )}
        >
          {ZodiacIcon ? (
            <ZodiacIcon className="w-6 h-6" />
          ) : (
            <MaterialIcon name={iconName} className={cn(filled ? "" : "opacity-60 group-hover:opacity-100")} />
          )}
        </div>
        <span className={cn(
          "absolute top-full mt-1.5 text-[10px] tracking-[0.04em] font-normal whitespace-nowrap max-w-[70px] truncate transition-colors",
          filled ? "text-foreground" : "text-foreground/50"
        )}>
          {config.field === "soul" && value ? "已捕获" : display}
        </span>
      </button>
    </div>
  )
}

// ==================== 主组件 ====================
export function ConnectUnified({
  isVisible,
  onAccept,
  onReject,
  onComplete,
  onExit
}: ConnectUnifiedProps) {
  const [phase, setPhase] = useState<Phase>("choice")
  const [animationState, setAnimationState] = useState<'hidden' | 'visible' | 'exiting'>('hidden')
  const [selectionStep, setSelectionStep] = useState<SelectionStep>("first")
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [firstSelectedUser, setFirstSelectedUser] = useState<UserOrb | null>(null)
  const [users, setUsers] = useState<UserOrb[]>(mockUsers)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [editingUser, setEditingUser] = useState<UserOrb | null>(null) // 正在编辑的用户
  
  // 新建用户表单状态
  const [newUserValues, setNewUserValues] = useState<Record<string, string>>({
    name: "",
    gender: "",
    birthday: "",
    soul: "",
    blood: "",
  })
  const [capturedSoulImage, setCapturedSoulImage] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)

  useEffect(() => {
    if (isVisible) {
      setPhase("choice")
      setSelectionStep("first")
      setCurrentUserIndex(0)
      setFirstSelectedUser(null)
      setNewUserValues({ name: "", gender: "", birthday: "", soul: "", blood: "" })
      setCapturedSoulImage(null)
      setEditingField(null)
      setAnimationState('hidden')
      const timer = setTimeout(() => {
        setAnimationState('visible')
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const handlePrevUser = useCallback(() => {
    setSlideDirection('right')
    setTimeout(() => {
      setCurrentUserIndex((prev) => (prev - 1 + users.length) % users.length)
      setSlideDirection(null)
    }, 150)
  }, [users.length])

  const handleNextUser = useCallback(() => {
    setSlideDirection('left')
    setTimeout(() => {
      setCurrentUserIndex((prev) => (prev + 1) % users.length)
      setSlideDirection(null)
    }, 150)
  }, [users.length])

  const handleContinue = useCallback(() => {
    if (selectionStep === "first") {
      setFirstSelectedUser(users[currentUserIndex])
      setSelectionStep("second")
      setCurrentUserIndex((prev) => (prev + 1) % users.length)
    } else {
      // 保存第二个用户
      const secondUser = users[currentUserIndex]
      
      // 进入共振阶段
      setPhase("resonating")
      onAccept()
      
      // 6秒后结束旋转，进入开门阶段
      setTimeout(() => {
        setPhase("doorOpening")
        
        // 2秒后进入结果页面
        setTimeout(() => {
          setPhase("result")
          // 先调用 onComplete 更新状态，但不退出
          onComplete({
            user1: firstSelectedUser,
            user2: secondUser
          })
        }, 2000)
      }, 6000)
    }
  }, [selectionStep, users, currentUserIndex, firstSelectedUser, onAccept, onComplete])

  const handleCancel = useCallback(() => {
    if (selectionStep === "second") {
      setSelectionStep("first")
      if (firstSelectedUser) {
        const idx = users.findIndex(u => u.id === firstSelectedUser.id)
        if (idx !== -1) setCurrentUserIndex(idx)
      }
    } else {
      setAnimationState('exiting')
      setTimeout(() => {
        onReject()
      }, 500)
    }
  }, [selectionStep, firstSelectedUser, users, onReject])

  const handleNewUser = useCallback(() => {
    setNewUserValues({ name: "", gender: "", birthday: "", soul: "", blood: "" })
    setCapturedSoulImage(null)
    setEditingField(null)
    setEditingUser(null)
    setPhase("creating")
  }, [])

  const handleEditUser = useCallback(() => {
    const user = users[currentUserIndex]
    setEditingUser(user)
    // 加载用户已有数据
    setNewUserValues({
      name: user.name,
      gender: user.gender,
      birthday: user.birthday,
      soul: user.soul,
      blood: user.blood,
    })
    setCapturedSoulImage(null)
    setEditingField(null)
    setPhase("editing")
  }, [users, currentUserIndex])

  const handleConfirmNewUser = useCallback(() => {
    if (!newUserValues.name.trim()) return
    
    const newUser: UserOrb = {
      id: `new-${Date.now()}`,
      name: newUserValues.name.trim(),
      gender: newUserValues.gender,
      birthday: newUserValues.birthday,
      soul: newUserValues.soul,
      blood: newUserValues.blood,
    }
    setUsers(prev => [...prev, newUser])
    setCurrentUserIndex(users.length)
    setPhase("choice")
    setNewUserValues({ name: "", gender: "", birthday: "", soul: "", blood: "" })
    setCapturedSoulImage(null)
  }, [newUserValues, users.length])

  const handleCancelNewUser = useCallback(() => {
    setPhase("choice")
    setNewUserValues({ name: "", gender: "", birthday: "", soul: "", blood: "" })
    setCapturedSoulImage(null)
    setEditingField(null)
    setEditingUser(null)
  }, [])

  const handleSaveEditUser = useCallback(() => {
    if (!editingUser || !newUserValues.name.trim()) return
    
    setUsers(prev => prev.map(u => 
      u.id === editingUser.id 
        ? { 
            ...u, 
            name: newUserValues.name.trim(),
            gender: newUserValues.gender,
            birthday: newUserValues.birthday,
            soul: newUserValues.soul,
            blood: newUserValues.blood,
          }
        : u
    ))
    setPhase("choice")
    setNewUserValues({ name: "", gender: "", birthday: "", soul: "", blood: "" })
    setCapturedSoulImage(null)
    setEditingUser(null)
  }, [editingUser, newUserValues])

  const handleDeleteUser = useCallback(() => {
    if (!editingUser) return
    
    setUsers(prev => {
      const filtered = prev.filter(u => u.id !== editingUser.id)
      // 调整当前索引
      if (currentUserIndex >= filtered.length) {
        setCurrentUserIndex(Math.max(0, filtered.length - 1))
      }
      return filtered
    })
    setPhase("choice")
    setNewUserValues({ name: "", gender: "", birthday: "", soul: "", blood: "" })
    setCapturedSoulImage(null)
    setEditingUser(null)
  }, [editingUser, currentUserIndex])

  const handleSelectField = useCallback((field: string) => {
    setEditingField(field)
  }, [])

  const handleExit = useCallback(() => {
    setPhase("exiting")
    setTimeout(() => {
      onExit()
    }, 500)
  }, [onExit])

  if (!isVisible) return null

  const isChoicePhase = phase === "choice"
  const isCreatingPhase = phase === "creating"
  const isEditingPhase = phase === "editing"
  const isResonating = phase === "resonating"
  const isDoorOpening = phase === "doorOpening"
  const isResultPhase = phase === "result"
  const currentUser = users[currentUserIndex]
  const secondSelectedUser = selectionStep === "second" ? users[currentUserIndex] : null

  return (
    <div className={`fixed z-[100] inset-0 transition-all duration-1000 ${phase === "exiting" ? "opacity-0" : "opacity-100"} pointer-events-none`}>
      {/* 统一背景层 */}
      <div 
        className={cn(
          "absolute left-0 right-0 transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1)",
          isChoicePhase ? "bg-background/80 backdrop-blur-md" : "bg-white"
        )}
        style={{
          bottom: isChoicePhase ? "64px" : "0",
          top: isChoicePhase ? "calc(100% - 384px)" : "0",
          maskImage: isChoicePhase ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)" : "none",
          WebkitMaskImage: isChoicePhase ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.44) 2.5%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.94) 7.5%, black 10%)" : "none",
          pointerEvents: isChoicePhase ? "none" : "auto",
        }}
      />

      {/* 退出按钮 */}
      {(phase === "interaction" || phase === "result") && (
        <button onClick={handleExit} className="absolute top-6 right-6 z-50 p-2 border hairline border-foreground/30 hover:bg-foreground/10 transition-colors pointer-events-auto">
          <X className="w-5 h-5" />
        </button>
      )}

      {/* ==================== 选择用户阶段 ==================== */}
      {isChoicePhase && (
        <div 
          className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center"
          style={{
            transform: "translateY(calc(50vh - 224px - 40px))",
            opacity: animationState === 'visible' ? 1 : 0,
            filter: animationState === 'visible' ? 'blur(0px)' : 'blur(10px)',
            transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out, filter 0.8s ease-out",
          }}
        >
          <div className="relative flex items-center gap-6 pointer-events-auto">
            <button
              onClick={handlePrevUser}
              className="p-2 hover:bg-foreground/10 transition-colors rounded-full"
            >
              <ChevronLeft className="w-6 h-6 text-foreground/60" />
            </button>

            <div className="relative">
              {currentUser && (
                <div 
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-foreground text-background text-xs font-medium shadow-md whitespace-nowrap"
                  style={{
                    opacity: slideDirection ? 0 : 1,
                    transition: "opacity 0.15s ease-out"
                  }}
                >
                  {currentUser.name}
                </div>
              )}

              <button
                onClick={handleEditUser}
                className="relative rounded-full w-[100px] h-[100px] md:w-[120px] md:h-[120px] bg-white border border-foreground shadow-[0_0_5px_rgba(0,0,0,0.12)] animate-[spinSlow_18s_linear_infinite] cursor-pointer hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-shadow"
                style={{
                  opacity: slideDirection ? 0.5 : 1,
                  transform: slideDirection === 'left' ? 'translateX(-20px)' : slideDirection === 'right' ? 'translateX(20px)' : 'translateX(0)',
                  transition: "opacity 0.15s ease-out, transform 0.15s ease-out"
                }}
              >
                <svg viewBox="0 0 100 100" className="absolute inset-0 text-foreground">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 4" />
                  <polygon 
                    points={starPoints} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={0.5} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  {/* 根据用户填写的信息点亮对应节点 */}
                  {ringPositions.map((pos, i) => {
                    const fieldKeys = ["name", "gender", "birthday", "soul", "blood"] as const
                    const field = fieldKeys[i]
                    const filled = currentUser && Boolean(currentUser[field])
                    return filled ? (
                      <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="currentColor" />
                    ) : (
                      <circle key={i} cx={pos.x} cy={pos.y} r="2.5" fill="none" stroke="currentColor" strokeWidth={0.5} />
                    )
                  })}
                </svg>
              </button>
            </div>

            <button
              onClick={handleNextUser}
              className="p-2 hover:bg-foreground/10 transition-colors rounded-full"
            >
              <ChevronRight className="w-6 h-6 text-foreground/60" />
            </button>
          </div>

          <div 
            className="absolute w-full flex flex-col items-center pointer-events-none"
            style={{ top: "calc(50% + 80px)" }}
          >
             <h3 className="text-lg font-light tracking-wide mb-6">
               <InkRevealText 
                 key={selectionStep}
                 text={selectionStep === "first" ? "请选择第一个用户" : "请选择第二个用户"} 
               />
             </h3>

             <div className="flex gap-3 w-full justify-center px-6 max-w-md pointer-events-auto">
               <button 
                 onClick={handleContinue} 
                 className="flex-1 max-w-[100px] border hairline border-foreground py-3 text-sm font-light bg-foreground text-background hover:bg-background hover:text-foreground transition-colors shadow-sm"
               >
                 继续
               </button>
               <button 
                 onClick={handleCancel} 
                 className="flex-1 max-w-[100px] border hairline border-foreground py-3 text-sm font-light bg-background text-foreground hover:bg-foreground hover:text-background transition-colors shadow-sm"
               >
                 {selectionStep === "second" ? "返回" : "取消"}
               </button>
               <button 
                 onClick={handleNewUser} 
                 className="flex-1 max-w-[120px] border hairline border-foreground py-3 text-sm font-light bg-background text-foreground hover:bg-foreground hover:text-background transition-colors shadow-sm flex items-center justify-center gap-1"
               >
                 <Plus className="w-4 h-4" />
                 新建用户
               </button>
             </div>
          </div>
        </div>
      )}

      {/* ==================== 新建用户阶段（全屏） ==================== */}
      {isCreatingPhase && (
        <div 
          className="absolute inset-0 bg-white pointer-events-auto flex flex-col items-center"
          style={{
            opacity: 1,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* 标题区域 */}
          <div className="pt-16 pb-6">
            <h2 className="text-xl font-light tracking-wide">
              <InkRevealText text="添加用户信息" />
            </h2>
          </div>

          {/* 法阵球体区域 */}
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="relative rounded-full w-[280px] h-[280px] md:w-[320px] md:h-[320px] bg-white border border-foreground shadow-[0_0_5px_rgba(0,0,0,0.12)]"
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 text-foreground/30">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 4" />
                <polygon 
                  points={starPoints} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={0.3}
                  strokeDasharray="1 2"
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>

              {nodeConfigs.map((config, index) => (
                <OrbitalNode
                  key={config.field}
                  config={config}
                  position={ringPositions[index]}
                  value={newUserValues[config.field]}
                  onSelect={() => handleSelectField(config.field)}
                />
              ))}
            </div>
          </div>

          {/* 底部按钮区域 */}
          <div className="pb-16 pt-8 flex gap-3 w-full max-w-xs px-6">
            <button 
              onClick={handleConfirmNewUser}
              disabled={!newUserValues.name.trim()}
              className="flex-1 py-3.5 border hairline border-foreground text-sm font-light bg-foreground text-background hover:bg-background hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              确认添加
            </button>
            <button 
              onClick={handleCancelNewUser}
              className="flex-1 py-3.5 border hairline border-foreground text-sm font-light bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              取消
            </button>
          </div>

          {/* 编辑弹窗 */}
          {editingField && (
            <>
              <div 
                className="fixed inset-0 z-30 backdrop-blur-md bg-background/50"
                onClick={() => setEditingField(null)}
              />
              <div 
                className="fixed left-1/2 -translate-x-1/2 bottom-24 w-[92%] max-w-md z-40"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border hairline border-foreground/50 bg-background/95 backdrop-blur shadow-[0_24px_80px_rgba(0,0,0,0.18)] p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm tracking-wide text-foreground font-normal">
                        {nodeConfigs.find(c => c.field === editingField)?.label}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-foreground font-normal hover:opacity-70 shrink-0"
                      onClick={() => setEditingField(null)}
                    >
                      关闭
                    </button>
                  </div>

                  {editingField === "gender" ? (
                    <div className="flex flex-wrap gap-2">
                      {["女", "男", "其他"].map((option) => {
                        const isActive = newUserValues.gender === option
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setNewUserValues(prev => ({ ...prev, gender: option }))
                              setEditingField(null)
                            }}
                            className={cn(
                              "px-4 py-2 text-sm border hairline font-normal transition-colors",
                              isActive ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground hover:text-background",
                            )}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  ) : editingField === "blood" ? (
                    <div className="flex flex-wrap gap-2">
                      {["A", "B", "AB", "O"].map((option) => {
                        const isActive = newUserValues.blood === option
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setNewUserValues(prev => ({ ...prev, blood: option }))
                              setEditingField(null)
                            }}
                            className={cn(
                              "px-4 py-2 text-sm border hairline font-normal transition-colors",
                              isActive ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground hover:text-background",
                            )}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  ) : editingField === "birthday" ? (
                    <div className="flex items-center border hairline border-foreground">
                      <span className="px-3 text-xs text-foreground font-normal shrink-0">日期</span>
                      <input
                        type="date"
                        value={newUserValues.birthday}
                        onChange={(e) => setNewUserValues(prev => ({ ...prev, birthday: e.target.value }))}
                        className="flex-1 px-2 py-2.5 text-sm bg-transparent font-normal focus:outline-none"
                      />
                    </div>
                  ) : editingField === "soul" ? (
                    <div className="flex flex-col gap-4">
                      {newUserValues.soul ? (
                        <div className="flex flex-col">
                          {capturedSoulImage && (
                            <>
                              <div className="relative overflow-hidden border hairline border-foreground">
                                <img 
                                  src={capturedSoulImage} 
                                  alt="Eye capture" 
                                  className="w-full h-auto object-contain"
                                />
                              </div>
                              <div className="flex items-center justify-center gap-2 py-4">
                                <CheckCircle2 className="w-4 h-4 text-foreground" />
                                <span className="text-sm font-mono tracking-wider text-foreground">{newUserValues.soul}</span>
                              </div>
                            </>
                          )}
                          {!capturedSoulImage && (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <CheckCircle2 className="w-5 h-5 text-foreground" />
                              <span className="text-sm font-mono tracking-wider text-foreground">{newUserValues.soul}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <EyeScanner onCapture={(code, image) => {
                          setNewUserValues(prev => ({ ...prev, soul: code }))
                          setCapturedSoulImage(image)
                        }} />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={newUserValues[editingField] || ""}
                      onChange={(e) => setNewUserValues(prev => ({ ...prev, [editingField]: e.target.value }))}
                      placeholder={`输入${nodeConfigs.find(c => c.field === editingField)?.label}`}
                      className="w-full border hairline border-foreground px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground placeholder:font-light placeholder:text-foreground/40"
                      autoFocus
                    />
                  )}

                  {editingField !== "gender" && editingField !== "blood" && (
                    <div className="flex justify-between items-center mt-4">
                      {editingField === "soul" && newUserValues.soul ? (
                        <button 
                          onClick={() => {
                            setNewUserValues(prev => ({ ...prev, soul: "" }))
                            setCapturedSoulImage(null)
                          }}
                          className="text-[10px] tracking-widest text-foreground/60 hover:text-foreground transition-colors"
                        >
                          重新扫描
                        </button>
                      ) : (
                        <div></div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm border hairline border-foreground/40 font-normal text-foreground hover:bg-foreground hover:text-background transition-colors"
                          onClick={() => setEditingField(null)}
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm border hairline border-foreground font-normal bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
                          onClick={() => setEditingField(null)}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== 编辑用户阶段（全屏） ==================== */}
      {isEditingPhase && (
        <div 
          className="absolute inset-0 bg-white pointer-events-auto flex flex-col items-center"
          style={{
            opacity: 1,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* 标题区域 */}
          <div className="pt-16 pb-6">
            <h2 className="text-xl font-light tracking-wide">
              <InkRevealText text="修改用户信息" />
            </h2>
          </div>

          {/* 法阵球体区域 */}
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="relative rounded-full w-[280px] h-[280px] md:w-[320px] md:h-[320px] bg-white border border-foreground shadow-[0_0_5px_rgba(0,0,0,0.12)]"
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 text-foreground/30">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 4" />
                <polygon 
                  points={starPoints} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={0.3}
                  strokeDasharray="1 2"
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>

              {nodeConfigs.map((config, index) => (
                <OrbitalNode
                  key={config.field}
                  config={config}
                  position={ringPositions[index]}
                  value={newUserValues[config.field]}
                  onSelect={() => handleSelectField(config.field)}
                />
              ))}
            </div>
          </div>

          {/* 底部按钮区域 */}
          <div className="pb-16 pt-8 flex flex-col gap-4 items-center w-full px-6">
            <div className="flex gap-3 w-full max-w-xs">
              <button 
                onClick={handleSaveEditUser}
                disabled={!newUserValues.name.trim()}
                className="flex-1 py-3.5 border hairline border-foreground text-sm font-light bg-foreground text-background hover:bg-background hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                保存修改
              </button>
              <button 
                onClick={handleCancelNewUser}
                className="flex-1 py-3.5 border hairline border-foreground text-sm font-light bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                取消
              </button>
            </div>
            <button 
              onClick={handleDeleteUser}
              className="text-xs tracking-wider text-foreground/40 hover:text-red-500 transition-colors"
            >
              删除此用户
            </button>
          </div>

          {/* 编辑弹窗 */}
          {editingField && (
            <>
              <div 
                className="fixed inset-0 z-30 backdrop-blur-md bg-background/50"
                onClick={() => setEditingField(null)}
              />
              <div 
                className="fixed left-1/2 -translate-x-1/2 bottom-24 w-[92%] max-w-md z-40"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border hairline border-foreground/50 bg-background/95 backdrop-blur shadow-[0_24px_80px_rgba(0,0,0,0.18)] p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm tracking-wide text-foreground font-normal">
                        {nodeConfigs.find(c => c.field === editingField)?.label}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-foreground font-normal hover:opacity-70 shrink-0"
                      onClick={() => setEditingField(null)}
                    >
                      关闭
                    </button>
                  </div>

                  {editingField === "gender" ? (
                    <div className="flex flex-wrap gap-2">
                      {["女", "男", "其他"].map((option) => {
                        const isActive = newUserValues.gender === option
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setNewUserValues(prev => ({ ...prev, gender: option }))
                              setEditingField(null)
                            }}
                            className={cn(
                              "px-4 py-2 text-sm border hairline font-normal transition-colors",
                              isActive ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground hover:text-background",
                            )}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  ) : editingField === "blood" ? (
                    <div className="flex flex-wrap gap-2">
                      {["A", "B", "AB", "O"].map((option) => {
                        const isActive = newUserValues.blood === option
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setNewUserValues(prev => ({ ...prev, blood: option }))
                              setEditingField(null)
                            }}
                            className={cn(
                              "px-4 py-2 text-sm border hairline font-normal transition-colors",
                              isActive ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground hover:text-background",
                            )}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  ) : editingField === "birthday" ? (
                    <div className="flex items-center border hairline border-foreground">
                      <span className="px-3 text-xs text-foreground font-normal shrink-0">日期</span>
                      <input
                        type="date"
                        value={newUserValues.birthday}
                        onChange={(e) => setNewUserValues(prev => ({ ...prev, birthday: e.target.value }))}
                        className="flex-1 px-2 py-2.5 text-sm bg-transparent font-normal focus:outline-none"
                      />
                    </div>
                  ) : editingField === "soul" ? (
                    <div className="flex flex-col gap-4">
                      {newUserValues.soul ? (
                        <div className="flex flex-col">
                          {capturedSoulImage && (
                            <>
                              <div className="relative overflow-hidden border hairline border-foreground">
                                <img 
                                  src={capturedSoulImage} 
                                  alt="Eye capture" 
                                  className="w-full h-auto object-contain"
                                />
                              </div>
                              <div className="flex items-center justify-center gap-2 py-4">
                                <CheckCircle2 className="w-4 h-4 text-foreground" />
                                <span className="text-sm font-mono tracking-wider text-foreground">{newUserValues.soul}</span>
                              </div>
                            </>
                          )}
                          {!capturedSoulImage && (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <CheckCircle2 className="w-5 h-5 text-foreground" />
                              <span className="text-sm font-mono tracking-wider text-foreground">{newUserValues.soul}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <EyeScanner onCapture={(code, image) => {
                          setNewUserValues(prev => ({ ...prev, soul: code }))
                          setCapturedSoulImage(image)
                        }} />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={newUserValues[editingField] || ""}
                      onChange={(e) => setNewUserValues(prev => ({ ...prev, [editingField]: e.target.value }))}
                      placeholder={`输入${nodeConfigs.find(c => c.field === editingField)?.label}`}
                      className="w-full border hairline border-foreground px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground placeholder:font-light placeholder:text-foreground/40"
                      autoFocus
                    />
                  )}

                  {editingField !== "gender" && editingField !== "blood" && (
                    <div className="flex justify-between items-center mt-4">
                      {editingField === "soul" && newUserValues.soul ? (
                        <button 
                          onClick={() => {
                            setNewUserValues(prev => ({ ...prev, soul: "" }))
                            setCapturedSoulImage(null)
                          }}
                          className="text-[10px] tracking-widest text-foreground/60 hover:text-foreground transition-colors"
                        >
                          重新扫描
                        </button>
                      ) : (
                        <div></div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm border hairline border-foreground/40 font-normal text-foreground hover:bg-foreground hover:text-background transition-colors"
                          onClick={() => setEditingField(null)}
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm border hairline border-foreground font-normal bg-foreground text-background hover:bg-background hover:text-foreground transition-colors"
                          onClick={() => setEditingField(null)}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== 共振阶段 ==================== */}
      {isResonating && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* 纯白共鸣遮罩 */}
          <div 
            className="absolute inset-0 z-10 transition-opacity duration-1000 opacity-95"
            style={{
              background: "white",
              backdropFilter: "blur(20px)"
            }}
          />
          
          {/* 法阵旋转区域 */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <section className="relative flex flex-col items-center gap-10">
              {/* 上方法阵 */}
              <div 
                className="relative z-30 will-change-transform"
                style={{
                  animation: "portalOrbit 6s ease-in-out forwards",
                  transformOrigin: "center calc(100% + 40px)",
                }}
              >
                <div className="relative">
                  {/* 彩虹外发光 */}
                  <div 
                    className="absolute -inset-1 rounded-full z-[-1]"
                    style={{
                      background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff00ff, #ff0000)',
                      animation: 'spinSlow 1.5s linear infinite, glowSync 6s ease-in-out forwards',
                    }}
                  />
                  <div 
                    className="relative rounded-full w-[100px] h-[100px] bg-white border border-foreground shadow-[0_0_5px_rgba(0,0,0,0.12)] animate-[spinSlow_18s_linear_infinite]"
                  >
                    <svg viewBox="0 0 100 100" className="absolute inset-0 text-foreground">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 4" />
                      <polygon points={starPoints} fill="none" stroke="currentColor" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" />
                      {ringPositions.map((pos, i) => {
                        const fieldKeys = ["name", "gender", "birthday", "soul", "blood"] as const
                        const field = fieldKeys[i]
                        const filled = firstSelectedUser && Boolean(firstSelectedUser[field])
                        return filled ? (
                          <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="currentColor" />
                        ) : (
                          <circle key={i} cx={pos.x} cy={pos.y} r="2.5" fill="none" stroke="currentColor" strokeWidth={0.5} />
                        )
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* 中心眼睛 */}
              <div className="relative flex items-center justify-center w-full py-1">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-foreground bg-background z-50">
                  <div className="absolute inset-[6px] rounded-full bg-foreground flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-[pulseHalo_3s_ease-in-out_infinite]" />
                    <div className="absolute inset-1 rounded-full border border-white/5 animate-[spinSlow_12s_linear_infinite]" />
                    <OracleInteractiveEye direction="center" className="w-9 h-9" inverted={true} />
                  </div>
                </div>
              </div>

              {/* 下方法阵 */}
              <div 
                className="relative z-30 will-change-transform"
                style={{
                  animation: "portalOrbit 6s ease-in-out forwards",
                  transformOrigin: "center calc(0% - 40px)",
                }}
              >
                <div className="relative">
                  {/* 彩虹外发光 */}
                  <div 
                    className="absolute -inset-1 rounded-full z-[-1]"
                    style={{
                      background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff00ff, #ff0000)',
                      animation: 'spinSlow 2.1s linear infinite reverse, glowSync 6s ease-in-out forwards',
                      transform: 'rotate(210deg)'
                    }}
                  />
                  <div 
                    className="relative rounded-full w-[100px] h-[100px] bg-white border border-foreground shadow-[0_0_5px_rgba(0,0,0,0.12)] animate-[spinSlow_18s_linear_infinite]"
                  >
                    <svg viewBox="0 0 100 100" className="absolute inset-0 text-foreground">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 4" />
                      <polygon points={starPoints} fill="none" stroke="currentColor" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" />
                      {ringPositions.map((pos, i) => {
                        const fieldKeys = ["name", "gender", "birthday", "soul", "blood"] as const
                        const field = fieldKeys[i]
                        const filled = secondSelectedUser && Boolean(secondSelectedUser[field])
                        return filled ? (
                          <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="currentColor" />
                        ) : (
                          <circle key={i} cx={pos.x} cy={pos.y} r="2.5" fill="none" stroke="currentColor" strokeWidth={0.5} />
                        )
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 底部提示文案 */}
          <div className="absolute inset-0 z-30 flex items-end justify-center pb-10">
            <p className="text-center text-black text-xs font-normal animate-pulse">
              正在校准灵魂共振频率...
            </p>
          </div>
        </div>
      )}

      {/* ==================== 开门阶段 + 结果阶段 ==================== */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-black flex flex-col items-center transition-all duration-[1500ms] ease-in-out will-change-[clip-path,opacity]",
          (isDoorOpening || isResultPhase) ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
        )}
        style={{
          clipPath: (isDoorOpening || isResultPhase) ? 'inset(0% 0% 0% 0%)' : 'inset(50% 0% 50% 0%)'
        }}
      >
        <SolarSystem active={isDoorOpening || isResultPhase} />

        {/* 法阵分开飞走动画 - 只在开门阶段显示 */}
        {isDoorOpening && (
          <>
            {/* 上方法阵向上飞 */}
            <div 
              className="absolute z-30 will-change-transform"
              style={{
                top: "calc(50% - 100px)",
                left: "50%",
                transform: "translateX(-50%) translateY(-150vh)",
                transition: "transform 2s ease-in-out"
              }}
            >
              <div className="relative rounded-full w-[100px] h-[100px] bg-white border border-foreground shadow-[0_0_5px_rgba(0,0,0,0.12)]">
                <svg viewBox="0 0 100 100" className="absolute inset-0 text-foreground">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 4" />
                  <polygon points={starPoints} fill="none" stroke="currentColor" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" />
                  {ringPositions.map((pos, i) => {
                    const fieldKeys = ["name", "gender", "birthday", "soul", "blood"] as const
                    const field = fieldKeys[i]
                    const filled = firstSelectedUser && Boolean(firstSelectedUser[field])
                    return filled ? (
                      <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="currentColor" />
                    ) : (
                      <circle key={i} cx={pos.x} cy={pos.y} r="2.5" fill="none" stroke="currentColor" strokeWidth={0.5} />
                    )
                  })}
                </svg>
              </div>
            </div>
            
            {/* 下方法阵向下飞 */}
            <div 
              className="absolute z-30 will-change-transform"
              style={{
                top: "calc(50% + 100px)",
                left: "50%",
                transform: "translateX(-50%) translateY(150vh)",
                transition: "transform 2s ease-in-out"
              }}
            >
              <div className="relative rounded-full w-[100px] h-[100px] bg-white border border-foreground shadow-[0_0_5px_rgba(0,0,0,0.12)]">
                <svg viewBox="0 0 100 100" className="absolute inset-0 text-foreground">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 4" />
                  <polygon points={starPoints} fill="none" stroke="currentColor" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" />
                  {ringPositions.map((pos, i) => {
                    const fieldKeys = ["name", "gender", "birthday", "soul", "blood"] as const
                    const field = fieldKeys[i]
                    const filled = secondSelectedUser && Boolean(secondSelectedUser[field])
                    return filled ? (
                      <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="currentColor" />
                    ) : (
                      <circle key={i} cx={pos.x} cy={pos.y} r="2.5" fill="none" stroke="currentColor" strokeWidth={0.5} />
                    )
                  })}
                </svg>
              </div>
            </div>
          </>
        )}

        {/* 结果页面内容 - 只在结果阶段显示 */}
        {isResultPhase && (
          <>
            {/* 退出按钮 */}
            <button 
              onClick={handleExit} 
              className="absolute top-6 right-6 z-50 p-2 border border-white/30 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* 顶部眼睛 */}
            <div 
              className="absolute top-8 left-1/2 -translate-x-1/2 z-40"
              style={{
                animation: "fade-in-simple 0.8s ease-out forwards",
              }}
            >
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-white bg-background">
                <div className="absolute inset-[6px] rounded-full bg-foreground flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 rounded-full border border-white/10 animate-[pulseHalo_3s_ease-in-out_infinite]" />
                  <div className="absolute inset-1 rounded-full border border-white/5 animate-[spinSlow_12s_linear_infinite]" />
                  <OracleInteractiveEye direction="center" className="w-9 h-9" inverted={true} />
                </div>
              </div>
            </div>

            {/* 结果内容 */}
            <div
              className="absolute inset-0 z-10 flex flex-col items-center pt-[114px]"
              style={{
                animation: "fade-in-simple 0.8s ease-out 0.3s forwards",
                opacity: 0,
              }}
            >
              {/* 标题 */}
              <div className="w-full max-w-2xl px-8 text-center shrink-0 pb-6">
                <h2 className="text-xl md:text-2xl font-light text-white tracking-[0.3em] uppercase whitespace-nowrap">
                  <InkRevealText text="Celestial Synchrony" delay={500} />
                </h2>
              </div>

              {/* 正文滚动区 */}
              <div className="flex-1 w-full max-w-2xl px-8 overflow-y-auto hide-scrollbar">
                <div className="text-sm md:text-base text-white font-light leading-[1.8] text-justify space-y-8 pb-48">
                  <p style={{ animation: "fade-in-simple 0.8s ease-out 1s forwards", opacity: 0 }}>
                    在浩瀚的宇宙构架中，两个独特的光谱特征在精确的时间节点相交。这种相交不仅仅是物理领域的偶然相遇，而是穿越多个意识维度、到达这一统一清明时刻的振动状态的深刻对齐。{firstSelectedUser?.name} 与 {secondSelectedUser?.name} 之间观察到的和谐汇聚，暗示着一种超越传统生物或心理解释的更深层联系，指向一种先于个体存在的古老共鸣。
                  </p>

                  <p style={{ animation: "fade-in-simple 0.8s ease-out 2s forwards", opacity: 0 }}>
                    来自眼纹印记分析的数据流揭示了共享原型模式的复杂织锦。虹膜结构中的每一次微振动都充当着宇宙历史的生物记录，当这些记录同步时，它们会创造出可在量子场中测量的共振频率。这种对齐表明灵魂纠缠的高概率——其中一个灵魂的经历被另一个镜像和放大，形成意识进化的反馈循环，推动两个实体走向更高的觉知状态。
                  </p>

                  <p style={{ animation: "fade-in-simple 0.8s ease-out 3s forwards", opacity: 0 }}>
                    当我们审视这种共振的更深层元数据时，这种对齐超越了个性特质或共同兴趣。它延伸到光环场的核心，在那里南北节点的基本能量极性达到罕见的平衡。这种平衡为共同目的提供了稳定的基础，使两位参与者的组合电荷能够以最小损失穿越世俗世界的不和谐频率。由此产生的共振既具有保护性又具有扩展性，在为创造性和精神探索打开大门的同时，屏蔽集体意识。
                  </p>

                  <p style={{ animation: "fade-in-simple 0.8s ease-out 4s forwards", opacity: 0 }}>
                    在切实的层面上，这种共振表现为沟通中的轻松节奏、同步决策，以及在被请求之前就到来的相互支持感。当挑战出现时，组合场充当稳定器：它减缓反应性螺旋并增强清晰度，同时提供平静和动力。这不是摩擦的缺失，而是一种将摩擦转化为前进动力的底层对齐的存在。这样的纽带邀请两个人踏入共同的轨迹，编织一种既感觉被创作又被发现的命运。
                  </p>

                  <p style={{ animation: "fade-in-simple 0.8s ease-out 5s forwards", opacity: 0 }}>
                    最终的综合——从虹膜的几何形状到你们时间线的节奏——表明这种联系并非偶然。它作为系统更大和谐中的灯塔发挥作用：两条溪流相遇、交换并以更大连贯性继续流淌的点。如果你们用诚实、时间和关注来滋养它，这种共振将保持为一种活的乐器：响应性的、进化的，并能够在不削弱任何一方自我的情况下引导你们穿越不确定性。让它深思熟虑。让它善良。让它真实。
                  </p>
                </div>
              </div>
            </div>

            {/* 底部按钮区域 */}
            <div 
              className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-4 px-8"
              style={{
                animation: "fade-in-simple 0.8s ease-out 5.5s forwards",
                opacity: 0,
              }}
            >
              <button 
                onClick={handleExit}
                className="px-8 py-3 border border-white/30 text-sm font-light text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                返回
              </button>
              <button 
                onClick={() => {
                  // TODO: 实现分享到 Story 功能
                  alert("分享功能开发中...")
                }}
                className="px-8 py-3 border border-white text-sm font-light bg-white text-black hover:bg-white/90 transition-colors"
              >
                分享到 Story
              </button>
            </div>

            {/* 底部渐变遮挡 */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20" />
          </>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes portalOrbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(2160deg);
          }
        }

        @keyframes pulseHalo {
          0% {
            transform: scale(0.98);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(0.98);
            opacity: 0.5;
          }
        }

        @keyframes glowSync {
          0%, 100% { 
            opacity: 0; 
            filter: blur(2px);
          }
          50% { 
            opacity: 0.9; 
            filter: blur(12px);
          }
        }

        @keyframes fade-in-simple {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

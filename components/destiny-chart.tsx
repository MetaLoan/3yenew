"use client"

import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { TextReveal } from "./text-reveal"

// 动态导入 StarfieldEffect 避免 SSR 问题
const StarfieldEffect = dynamic(
  () => import("./starfield-effect").then((mod) => mod.StarfieldEffect),
  { ssr: false }
)

interface DataPoint {
  hour: number
  value: number
}

interface DestinyChartProps {
  mode: "today" | "life"
  showChart?: boolean
  selectedHour: number | null
  onSelectHour: (hour: number | null) => void
  onCardSelect?: () => void
}

// 所有卡片文件名
const CARD_FILES = [
  "0603205238985_00_93f05f199fe56df4354be531f1666b53.jpg",
  "0603205238985_02_5d4153da20d3d91dc0b84dd27247c1a5.jpg",
  "0603205238985_03_5c4ec1905aeae9bec5909153315e0269.jpg",
  "0603205238985_04_e8af89ff25c8ad2180e1d6b564fe1930.jpg",
  "0603205238985_05_64a833c7ec42a8634fd0bbc92a1820a3.jpg",
  "0603205238985_06_2f083cd664f6a22ef6a6bb0033183204.jpg",
  "0603205238985_07_7049a3682c6707cd661a0c92b0d4b8a0.jpg",
  "0603205238985_08_c9344575d1cfb36a722090fa6f465eda.jpg",
  "0603205238985_09_fdb39f49409ce4c2a134479f4eb457f5.jpg",
  "0603205238985_10_73075cf1cc03d23a3c959b8d3907aa8c.jpg",
  "0603205238985_11_aa5c6d94399a6c68c5ccf0938200b98d.jpg",
  "0603205238985_12_cb2452b3e455ec55a11fe96848da0f79.jpg",
  "0603205238985_13_8a692ffa7c224b4ca161439322e33f37.jpg",
  "0603205238985_14_b69ffe0fc74c305601c760be0000c7d9.jpg",
  "0603205238985_15_ad3f1fc96c2cae2a0b41441c428b6d7b.jpg",
  "0603205238985_16_3f282861b00f9fe6246cd8079fa7979e.jpg",
  "0603205238985_17_9bdf22277b1ca874d5a917140147278b.jpg",
  "0603205238985_18_6fbc854cb785a8cee939e015aa27dbf5.jpg",
  "0603205238985_19_268a5422bfd02678fbae1d39b384078c.jpg",
  "0603205238985_20_293caf99d19b4ba945159633c916d22a.jpg",
  "0603205238985_21_696ecb953297e3192d5f2c898e16b131.jpg",
  "0603205238985_22_cb000efb9912b049b4ac4b2f450880b2.jpg",
  "0603205238985_23_22ed1687f1e202dc482890610651359b.jpg",
  "0603205238985_24_573cb51379511fac771ec62bf35de19a.jpg",
  "0603205238985_25_f81b98bea89c8cba692948138ebd82df.jpg",
  "0603205238985_26_bd3ba5d3b1f11bc058249188d3a71a65.jpg",
  "0603205238985_27_6a8a0ca314e8ac55dd143a9c4042f2df.jpg",
  "0603205238985_28_a14a3ab44e937ba0de149408c8480729.jpg",
  "0603205238985_29_1b6a140aedd216e64a674cf9a6c41b58.jpg",
  "0603205238985_30_04e181abfa90d0f747c0497fe350d59b.jpg",
  "0603205238985_31_f88b72539a9a9779f8cf313cb566767c.jpg",
  "0603205238985_32_67f868802676ebce90a210d956fc0294.jpg",
  "0603205238985_33_ac2ff146e881ad7299d39cd40120a7dd.jpg",
  "0603205238985_34_06fe5991a12a0e820ca8447aa7af002f.jpg",
  "0603205238985_35_b1a791a787875aede882b7448a94a834.jpg",
  "0603205238985_36_678c7a520dc6d9f72b26966f477092dc.jpg",
  "0603205238985_37_4f17a5163b978034a5b8a841b121443f.jpg",
  "0603205238985_38_5da1301e81586bcf8c47b1d94ba468a2.jpg",
  "0603205238985_39_c50a4a2b55cdd14c62afa7bb3a8a2fcf.jpg",
  "0603205238985_40_c5bee31e1c8097c9d27b0b3851976433.jpg",
  "0603205238985_41_dbd7e4f939f2bbf0be8f4747f85a696c.jpg",
  "0603205238985_42_b90e636ae4a7bfb9be97780bf285cf4f.jpg",
  "0603205238985_43_88df5949ec785c0a52e205e8c38eec31.jpg",
  "0603205238985_44_2699f4553247ad8fd0b10062199d6173.jpg",
  "0603205238985_45_d6c490c86d283bde215abad952b920f6.jpg",
  "0603205238985_46_d684f3dfaea4ff1f3dd4a3a5bb8e77fa.jpg",
  "0603205238985_47_b883905ee3aebd3ca64c142c64972734.jpg",
  "0603205238985_48_2ed9176076924d8f685406e304a2eeed.jpg",
  "0603205238985_49_a2c774c05026e44ef20f7f62fe54326c.jpg",
  "0603205238985_50_063fba44f1a033a2093808ef2a485070.jpg",
  "0603205238985_51_9f25eaa7c24df141d7c46e7a7249540f.jpg",
  "0603205238985_52_dc83a5e1ab8670b65fa0936705cb3cc5.jpg",
  "0603205238985_53_12af23e32d659ec73b276020ddf64c56.jpg",
  "0603205238985_54_2d0e5181347701959cca210db239487b.jpg",
  "0603205238985_55_9678e102349090196462da7b876869f2.jpg",
  "0603205238985_56_2c025245d18e13aa89bce15bdb949e6a.jpg",
  "0603205238985_57_6d88d900c18809aaa1556f523d86edce.jpg",
  "0603205238985_58_d2627b0bdaf92ca202b9d578f52be080.jpg",
  "0603205238985_59_8c86e6bbff27661032b574a00b564182.jpg",
  "0603205238985_60_484c1e947ec887147750d73bebcc445f.jpg",
  "0603205238985_61_cb93169c7f120640584c2b00883308ae.jpg",
  "0603205238985_62_4fa0a11fd5c5a00edcf37ac3f74d2368.jpg",
  "0603205238985_63_f02af86ef55229b471c1d1253058b510.jpg",
  "0603205238985_64_eb7c6746fbeb4552de04798d005a36f0.jpg",
  "0603205238985_65_5018e5b72e8ce116f1376028264ff011.jpg",
  "0603205238985_66_9382be81d66ecc68554be184f491e74e.jpg",
  "0603205238985_67_ca47dcd4f58e8abc3b28f195a05e0d6a.jpg",
  "0603205238985_68_1e943fd4e127e727cb382f0a37e86547.jpg",
  "0603205238985_69_97a9f13f1c3faa0055f618793814566d.jpg",
  "0603205238985_70_21a2e3232549fb406da262e7797c90ab.jpg",
  "0603205238985_71_9c63f27770932ab0a1157e3b4451f3ff.jpg",
  "0603205238985_72_9e15c3c6db108357f05fbec114896e86.jpg",
  "0603205238985_73_539ab150d137b2806c779b2eb3d1c524.jpg",
  "0603205238985_74_c8de13051cf37f0034195c0a15fc832d.jpg",
  "0603205238985_75_efa6dbb48e298f27acdd3c04dd98e241.jpg",
  "0603205238985_76_219a1516764dd89076f68cc3fe13f06b.jpg",
  "0603205238985_77_254af0100053c750f194bd3cb5e7ff66.jpg",
  "0603205238985_78_acb14b5f1e2011ce9729ab2925e95c0c.jpg",
]

// 随机选择三张不同的卡片
const getRandomCards = (): string[] => {
  const shuffled = [...CARD_FILES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const generateData = (seed: number) => {
  return Array.from({ length: 13 }, (_, i) => {
    const hour = i * 2
    const value = 40 + 
      Math.sin(hour * 0.5 + seed) * 20 + 
      Math.cos(hour * 0.3) * 15 + 
      (Math.sin(hour * 0.8) * 10)
    return { hour, value }
  })
}

export function DestinyChart({ mode, showChart = true, selectedHour, onSelectHour, onCardSelect }: DestinyChartProps) {
  const maxValue = 100
  const width = 300
  const height = 150
  
  // 卡片状态 - 在客户端初始化以避免 hydration 错误
  const [cards, setCards] = useState<string[]>([])
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [isFlipping, setIsFlipping] = useState(false) // 正在翻转动画中
  const [isFlipped, setIsFlipped] = useState(false) // 已经翻转完成（保持翻转状态）
  const [isOthersHiding, setIsOthersHiding] = useState(false) // 其他卡片消失阶段
  const [isCentering, setIsCentering] = useState(false) // 卡片居中阶段
  const [isShaking, setIsShaking] = useState(false) // 卡片剧烈晃动阶段
  const [isShrinking, setIsShrinking] = useState(false)
  const [isBlurring, setIsBlurring] = useState(false) // 高斯模糊消失阶段
  const [isTransitioning, setIsTransitioning] = useState(false) // 容器尺寸过渡阶段
  const [cardName, setCardName] = useState<string>("") // 卡片名字
  const [cardReading, setCardReading] = useState<string>("")
  const [showReading, setShowReading] = useState(false) // 控制解读文字显示动画
  const [readingMode, setReadingMode] = useState<"idle" | "fadein" | "fadeaway">("idle") // 文字动画模式
  const [hintMode, setHintMode] = useState<"idle" | "fadein" | "fadeaway">("idle") // 顶部提示文字动画模式
  const [warpSpeed, setWarpSpeed] = useState(1) // 星际穿越速度倍数
  const [colorMode, setColorMode] = useState<"normal" | "rainbow" | "fading">("normal") // 粒子颜色模式
  const [energyValue, setEnergyValue] = useState<number>(50) // 目标能量值
  const [displayEnergy, setDisplayEnergy] = useState<number>(50) // 显示的能量值（用于丝滑动画）
  const displayEnergyRef = useRef<number>(50) // 用于动画的 ref
  
  // 卡片界面高度（与图表区域高度一致）
  const cardContainerHeight = 263 // StarfieldEffect canvas 的高度
  
  // 卡片对应的名字和解读文字
  const cardNames = [
    "The Wheel of Fortune",
    "Temperance",
    "Death"
  ]
  const cardReadings = [
    "The wheel turns in your favor",
    "Harmony awaits your next move",
    "Embrace the change within"
  ]
  
  // 每张卡片独立的动画参数
  const [cardAnimParams, setCardAnimParams] = useState<{
    floatDuration: number
    floatDelay: number
    floatDistance: number
    colorSpeed: number
    colorOffset: number
  }[]>([])
  
  // 客户端初始化随机卡片和动画参数
  useEffect(() => {
    setCards(getRandomCards())
    // 为三张卡片生成独立的动画参数
    setCardAnimParams([
      {
        floatDuration: 2.5 + Math.random() * 1.5, // 2.5-4s
        floatDelay: Math.random() * 2, // 0-2s 延迟
        floatDistance: 6 + Math.random() * 6, // 6-12px
        colorSpeed: 3 + Math.random() * 4, // 3-7s 颜色循环
        colorOffset: Math.random() * 360 // 起始色相偏移
      },
      {
        floatDuration: 2.5 + Math.random() * 1.5,
        floatDelay: Math.random() * 2,
        floatDistance: 6 + Math.random() * 6,
        colorSpeed: 3 + Math.random() * 4,
        colorOffset: Math.random() * 360
      },
      {
        floatDuration: 2.5 + Math.random() * 1.5,
        floatDelay: Math.random() * 2,
        floatDistance: 6 + Math.random() * 6,
        colorSpeed: 3 + Math.random() * 4,
        colorOffset: Math.random() * 360
      }
    ])
  }, [])
  
  // 速度加速动画引用
  const speedAnimationRef = useRef<number | null>(null)
  
  // 处理卡片点击
  const handleCardClick = (index: number) => {
    if (selectedCard !== null || isFlipping) return
    setSelectedCard(index)
    setCardName(cardNames[index]) // 预设卡片名字
    setCardReading(cardReadings[index]) // 预设解读内容
    
    // 立即触发顶部提示文字 fadeaway
    setHintMode("fadeaway")
    
    // 阶段1: 其他卡片消失 + 选中卡片丝滑移动到中间 (0.5s)
    setIsOthersHiding(true)
    setIsCentering(true)
    
    // 阶段2: 卡片居中后开始剧烈晃动 + 星际穿越加速 (0.5s后开始)
    setTimeout(() => {
      setIsShaking(true)
      setColorMode("rainbow") // 加速时粒子变彩色
      
      // 星际穿越速度线性加速从1X到10X (2秒内完成)
      const startTime = Date.now()
      const duration = 2000 // 2秒
      const startSpeed = 1
      const endSpeed = 10
      
      const animateSpeed = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // 使用 easeInQuad 缓动函数让加速感更强烈
        const easedProgress = progress * progress
        const currentSpeed = startSpeed + (endSpeed - startSpeed) * easedProgress
        setWarpSpeed(currentSpeed)
        
        if (progress < 1) {
          speedAnimationRef.current = requestAnimationFrame(animateSpeed)
        } else {
          // 速度达到10X后，晃动停止，卡片静止一下
          setIsShaking(false)
          
          // 停顿 10ms 后开始翻转
          setTimeout(() => {
            setIsFlipping(true)
            
            // 下一帧再设置 isFlipped，确保 transition 生效
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setIsFlipped(true) // 触发翻转动画
                
                // 翻转后开始彩色粒子渐变消失
                setColorMode("fading")
              })
            })
            
            // 翻转动画完成后 (0.5s)
            setTimeout(() => {
              setIsFlipping(false) // 动画结束，但 isFlipped 保持 true
              
              // 粒子淡出后，显示解读文字
              setTimeout(() => {
                setShowReading(true)
                setReadingMode("fadein") // 文字逐字出现
              }, 1500)
              
            }, 500)
          }, 10)
        }
      }
      
      speedAnimationRef.current = requestAnimationFrame(animateSpeed)
    }, 500)
  }
  
  // 清理速度动画
  useEffect(() => {
    return () => {
      if (speedAnimationRef.current) {
        cancelAnimationFrame(speedAnimationRef.current)
      }
    }
  }, [])
  
  // 文字动画完成回调
  const handleReadingComplete = useCallback(() => {
    if (readingMode === "fadein") {
      // 逐字出现完成后，停留5秒，然后开始逐字消失
      setTimeout(() => {
        setReadingMode("fadeaway")
      }, 5000)
    } else if (readingMode === "fadeaway") {
      // 逐字消失完成后，开始高斯模糊过渡
      setIsBlurring(true)
      // 保持 fading 模式，让粒子保持白色/透明状态
      // 不要改回 normal 模式，否则会重新显示彩色粒子
      
      // 开始容器收缩过渡
      setTimeout(() => {
        setIsTransitioning(true)
        setIsShrinking(true)
      }, 300)
      
      // 显示图表
      setTimeout(() => {
        onCardSelect?.()
      }, 800)
    }
  }, [readingMode, onCardSelect])
  
  // 获取当前真实时间
  const [now, setNow] = useState(() => new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  // 当前小时（向下取整到最近的偶数小时）
  const currentHour = Math.floor(now.getHours() / 2) * 2
  const nextHour = currentHour + 2 // 下一个即将到来的时间点
  
  // 计算倒计时
  const countdown = useMemo(() => {
    const nextTime = new Date(now)
    nextTime.setHours(nextHour, 0, 0, 0)
    
    const diff = nextTime.getTime() - now.getTime()
    if (diff <= 0) return "00:00:00"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [now, nextHour])

  const data = useMemo(() => generateData(mode === "today" ? 1 : 2), [mode])

  // 能量值实时波动效果
  useEffect(() => {
    if (!showChart) return
    
    // 计算基准能量值
    const getBaseEnergy = () => {
      const currentDataPoint = data.find(d => d.hour === currentHour)
      if (currentDataPoint) return currentDataPoint.value
      const prevPoint = data.find(d => d.hour <= currentHour)
      const nextPoint = data.find(d => d.hour > currentHour)
      if (prevPoint && nextPoint) {
        const ratio = (currentHour - prevPoint.hour) / (nextPoint.hour - prevPoint.hour)
        return prevPoint.value + (nextPoint.value - prevPoint.value) * ratio
      }
      return data[0]?.value || 50
    }
    
    const baseEnergy = getBaseEnergy()
    setEnergyValue(baseEnergy)
    
    // 每1000ms更新一次，模拟小幅波动
    const fluctuationTimer = setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * 2 // -1 到 +1 的波动
      setEnergyValue(prev => {
        // 限制波动范围在基准值 ±3 内，并确保不超出0-100
        const newValue = prev + fluctuation * 0.5
        const minBound = Math.max(0, baseEnergy - 3)
        const maxBound = Math.min(100, baseEnergy + 3)
        return Math.max(minBound, Math.min(maxBound, newValue))
      })
    }, 1000)
    
    return () => clearInterval(fluctuationTimer)
  }, [showChart, data, currentHour])

  // 丝滑数字过渡动画
  useEffect(() => {
    let animationId: number
    const animate = () => {
      const current = displayEnergyRef.current
      const target = energyValue
      const diff = target - current
      
      // 使用 lerp（线性插值）实现丝滑过渡
      if (Math.abs(diff) > 0.001) {
        const newValue = current + diff * 0.1 // 每帧移动 10% 的差距
        displayEnergyRef.current = newValue
        setDisplayEnergy(newValue)
        animationId = requestAnimationFrame(animate)
      } else {
        displayEnergyRef.current = target
        setDisplayEnergy(target)
      }
    }
    
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [energyValue])

  const { pastPathData, futurePathData, areaPathData, points } = useMemo(() => {
    if (!data.length) return { pastPathData: "", futurePathData: "", areaPathData: "", points: [] }
    
    const pts = data.map((d) => ({
      x: (d.hour / 24) * width,
      y: height - (d.value / maxValue) * height,
      hour: d.hour,
      value: d.value
    }))

    const pastPts = pts.filter(p => p.hour <= currentHour)
    const futurePts = pts.filter(p => p.hour >= currentHour)

    const createSmoothPath = (p: typeof pts) => {
      if (p.length < 2) return ""
      let d = `M ${p[0].x} ${p[0].y}`
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i]
        const p1 = p[i + 1]
        const cp1x = p0.x + (p1.x - p0.x) / 3
        const cp2x = p1.x - (p1.x - p0.x) / 3
        d += ` C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`
      }
      return d
    }

    let areaD = ""
    if (pastPts.length >= 2) {
      areaD = `M ${pastPts[0].x} ${height}`
      areaD += ` L ${pastPts[0].x} ${pastPts[0].y}`
      const curve = createSmoothPath(pastPts).replace("M", "L")
      areaD += curve
      areaD += ` L ${pastPts[pastPts.length - 1].x} ${height} Z`
    }
    
    return { 
      pastPathData: createSmoothPath(pastPts), 
      futurePathData: createSmoothPath(futurePts),
      areaPathData: areaD,
      points: pts
    }
  }, [data, width, height, maxValue, currentHour])

  const gradientStops = useMemo(() => {
    const pastData = data.filter(d => d.hour <= currentHour)
    return pastData.map((d, i) => {
      const offset = (d.hour / 24) * 100
      let color = "var(--holographic-mid-1)"
      if (d.value < 45) color = "var(--holographic-start)"
      if (d.value > 65) color = "var(--holographic-end)"
      return { offset: `${offset}%`, color }
    })
  }, [data, currentHour])

  return (
    <div className="w-full select-none">
      <div 
        className={`relative overflow-hidden ${showChart ? 'box-frame' : 'border border-foreground'}`} 
        style={{
          backgroundColor: !showChart ? (isShrinking ? 'transparent' : '#fff') : undefined,
          // 容器尺寸过渡：向下拉伸变化
          transformOrigin: 'top center', // 从顶部向下拉伸
          transition: 'background-color 0.4s ease-out'
        }}
      >
        {/* Singularity Shader - 未抽卡时显示 */}
        {!showChart && (
          <>
            <div 
              className="absolute inset-0 z-10"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at center, black 60%, transparent 95%)',
                maskImage: 'radial-gradient(ellipse 100% 100% at center, black 60%, transparent 95%)',
                opacity: isBlurring ? 0 : 1,
                filter: isBlurring ? 'blur(20px)' : 'blur(0px)',
                transform: isBlurring ? 'scale(1.1)' : 'scale(1)',
                transition: 'opacity 0.6s ease-out, filter 0.6s ease-out, transform 0.6s ease-out'
              }}
            >
              <StarfieldEffect speedMultiplier={warpSpeed} colorMode={colorMode} />
            </div>
            
            {/* 顶部提示文字 - 位于 StarfieldEffect 容器上边缘下方 */}
            <div 
              className="absolute z-30 left-0 right-0 text-center"
              style={{ 
                top: '20px',
                opacity: isBlurring ? 0 : 1,
                filter: isBlurring ? 'blur(10px)' : 'blur(0px)',
                transform: isBlurring ? 'translateY(-10px)' : 'translateY(0)',
                transition: 'opacity 0.5s ease-out, filter 0.5s ease-out, transform 0.5s ease-out'
              }}
            >
              {/* 初始提示文字 - 使用 TextReveal 实现 fadeaway */}
              {hintMode !== "fadeaway" ? (
                <span 
                  className="text-[12px] tracking-widest text-foreground  animate-pulse absolute left-0 right-0"
                >
                  Draw Card to Unlock Today's Destiny
                </span>
              ) : !showReading && (
                <div className="absolute left-0 right-0">
                  <TextReveal
                    text="Draw Card to Unlock Today's Destiny"
                    mode="fadeaway"
                    className="text-[12px] tracking-widest text-foreground "
                    delayPerChar={12}
                  />
                </div>
              )}
            </div>
            
            {/* 卡片解读文字 - 位于卡片下方 */}
            <div 
              className="absolute z-30 left-0 right-0 text-center flex flex-col items-center gap-1"
              style={{ 
                bottom: '20px',
                opacity: isBlurring ? 0 : 1,
                filter: isBlurring ? 'blur(10px)' : 'blur(0px)',
                transform: isBlurring ? 'translateY(10px)' : 'translateY(0)',
                transition: 'opacity 0.5s ease-out, filter 0.5s ease-out, transform 0.5s ease-out'
              }}
            >
              {/* 第一行：卡片名字 */}
              {showReading && (
                <TextReveal
                  text={cardName}
                  mode={readingMode}
                  className="text-[14px] font-normal tracking-wider text-foreground"
                  delayPerChar={readingMode === "fadeaway" ? 8 : 45}
                  startDelay={0}
                />
              )}
              {/* 第二行：解读文字 - 延迟开始 */}
              {showReading && (
                <TextReveal
                  text={cardReading}
                  mode={readingMode}
                  className="text-[11px] tracking-widest text-foreground/70 italic"
                  delayPerChar={readingMode === "fadeaway" ? 10 : 35}
                  startDelay={readingMode === "fadeaway" ? 0 : cardName.length * 45 + 200}
                  onComplete={handleReadingComplete}
                />
              )}
            </div>
            
            {/* 卡片选择界面 */}
            <div 
              className="absolute z-20 flex flex-col items-center justify-center"
              style={{ 
                width: `${width}px`, 
                height: `${height}px`,
                left: '50%',
                top: showReading ? '40px' : '50px',
                transform: isShrinking 
                  ? 'translateX(-50%) scale(0.9)' 
                  : showReading 
                    ? 'translateX(-50%) scale(1.1)'
                    : 'translateX(-50%) scale(1)',
                opacity: isBlurring ? 0 : 1,
                filter: isBlurring ? 'blur(20px)' : 'blur(0px)',
                transition: 'opacity 0.5s ease-out, filter 0.5s ease-out, transform 0.5s ease-out, top 0.5s ease-out'
              }}
            >
              {/* 三张卡片 */}
              <div 
                className="flex items-center justify-center gap-3 relative w-full" 
                style={{ height: `${height}px`, perspective: '1000px' }}
              >
                {cards.length > 0 && cards.map((card, index) => {
                  const isSelected = selectedCard === index
                  const isOther = selectedCard !== null && selectedCard !== index
                  const animParams = cardAnimParams[index]
                  
                  // 卡片尺寸：保持与素材一致的长宽比（1150:1920）
                  // 根据图表尺寸计算卡片尺寸，确保卡片界面大小和图表一样
                  const cardAspectRatio = 1150 / 1920 // 素材的实际比例 ≈ 0.599
                  // 计算卡片尺寸，使其能够适配图表区域（300x150）
                  // 考虑三张卡片 + 间距，可用宽度约为 width / 3.2
                  const availableWidth = width / 3.2 // 每张卡片的可用宽度
                  const availableHeight = height * 0.85 // 可用高度（留出提示文字空间）
                  
                  // 根据宽度和高度限制，选择较小的约束
                  let cardWidth = availableWidth
                  let cardHeight = cardWidth / cardAspectRatio
                  
                  // 如果高度超出限制，则根据高度重新计算
                  if (cardHeight > availableHeight) {
                    cardHeight = availableHeight
                    cardWidth = cardHeight * cardAspectRatio
                  }
                  
                  const gap = 12
                  const totalWidth = cardWidth * 3 + gap * 2
                  const firstCardLeft = `calc(50% - ${totalWidth / 2}px)`
                  
                  // 中间卡片(index === 1)本身就在中间，不需要居中动画
                  const isMiddleCard = index === 1
                  // 计算卡片位置：选中后居中（除非是中间卡片），否则按原位置排列
                  const shouldCenter = isSelected && isCentering && !isMiddleCard
                  const cardLeft = shouldCenter 
                    ? '50%' 
                    : `calc(${firstCardLeft} + ${index * (cardWidth + gap)}px)`
                  
                  // 计算 transform - 分阶段动画
                  let cardTransform = 'rotateY(0deg)'
                  if (isSelected) {
                    if (isShrinking) {
                      // 最后收缩阶段 - 已翻转
                      cardTransform = shouldCenter 
                        ? 'translateX(-50%) scale(0.9) rotateY(180deg)' 
                        : 'scale(0.9) rotateY(180deg)'
                    } else if (isFlipped) {
                      // 已翻转状态（包括正在翻转和翻转完成）
                      cardTransform = shouldCenter 
                        ? 'translateX(-50%) rotateY(180deg)' 
                        : 'rotateY(180deg)'
                    } else if (shouldCenter) {
                      // 居中但未翻转（晃动阶段）
                      cardTransform = 'translateX(-50%) rotateY(0deg)'
                    } else {
                      // 中间卡片本身就在中间，未翻转
                      cardTransform = 'rotateY(0deg)'
                    }
                  }
                  
                  // 漂浮动画名称
                  const floatAnimName = `card-float-${index}`
                  
                  // 选中卡片的动画：漂浮 -> 晃动 -> 翻转
                  let cardAnimation = 'none'
                  if (selectedCard === null && animParams) {
                    // 未选中：漂浮动画
                    cardAnimation = `${floatAnimName} ${animParams.floatDuration}s ease-in-out ${animParams.floatDelay}s infinite`
                  } else if (isSelected && isShaking) {
                    // 选中且晃动中：根据是否需要居中选择不同的晃动动画
                    cardAnimation = isMiddleCard 
                      ? 'card-shake-center 0.08s ease-in-out infinite'
                      : 'card-shake 0.08s ease-in-out infinite'
                  } else if (isSelected && isFlipping) {
                    // 翻转动画
                    cardAnimation = isMiddleCard
                      ? 'card-flip-center 0.5s ease-out forwards'
                      : 'card-flip 0.5s ease-out forwards'
                  }
                  
                  return (
                    <div
                      key={card}
                      onClick={() => handleCardClick(index)}
                      className="absolute cursor-pointer"
                      style={{ 
                        width: `${cardWidth}px`, 
                        height: `${cardHeight}px`,
                        left: cardLeft,
                        transformStyle: 'preserve-3d',
                        transform: cardTransform,
                        zIndex: isSelected ? 10 : 1,
                        opacity: isOther && isOthersHiding ? 0 : 1,
                        filter: isOther && isOthersHiding ? 'blur(10px)' : 'none',
                        transition: isShaking ? 'none' : (isFlipping ? 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'),
                        animation: cardAnimation
                      }}
                    >
                      {/* 卡片背面 */}
                      <div 
                        className="absolute inset-0 backface-hidden box-frame !border-black overflow-hidden"
                        style={{ 
                          backfaceVisibility: 'hidden'
                        }}
                      >
                        {/* 渐变背景层 - 使用 hue-rotate 实现丝滑颜色变化 */}
                        <div 
                          className="absolute inset-0 z-0"
                          style={{
                            background: 'linear-gradient(135deg, hsl(200, 60%, 92%) 0%, hsl(260, 50%, 88%) 50%, hsl(320, 55%, 90%) 100%)',
                            animation: animParams 
                              ? `card-hue-rotate ${animParams.colorSpeed}s linear infinite` 
                              : 'none',
                            animationDelay: animParams ? `${-animParams.colorOffset / 360 * animParams.colorSpeed}s` : '0s'
                          }}
                        />
                        {/* 镭射光层 - 调低透明度 */}
                        <div className="absolute inset-0 holographic holographic-animate opacity-30 z-0" />
                        
                        <div className="w-full h-full flex items-center justify-center relative z-10">
                          {/* 镭射质感叠加层 */}
                          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
                          
                          <div className="relative z-10 flex items-center justify-center w-full h-full">
                            {index === 0 && (
                              <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center">
                                <div className="w-4 h-4 bg-black rounded-full" />
                              </div>
                            )}
                            {index === 1 && (
                              <div className="w-10 h-10 border-2 border-black rotate-45 flex items-center justify-center">
                                <div className="w-4 h-4 bg-black" />
                              </div>
                            )}
                            {index === 2 && (
                              <div className="w-10 h-10 flex items-center justify-center relative pt-1">
                                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-black" />
                                <div className="absolute top-[45%] w-2 h-2 bg-white rounded-full translate-y-1" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* 卡片正面 */}
                      <div 
                        className="absolute inset-0 backface-hidden box-frame overflow-hidden"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <img 
                          src={`/card/${card}`}
                          alt="Tarot Card"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
        
        {/* 图表内容 */}
        <div 
          className="relative p-8 bg-background"
          style={{
            opacity: showChart ? 1 : 0,
            filter: showChart ? 'blur(0px)' : 'blur(10px)',
            transform: showChart ? 'scaleY(1)' : 'scaleY(0.9)',
            transformOrigin: 'top center', // 从顶部向下拉伸
            transition: 'opacity 0.5s ease-out, filter 0.5s ease-out, transform 0.5s ease-out'
          }}
        >
          {/* 实时能量场数值显示 */}
          {showChart && (
            <div className="mb-6 pb-4 border-b-[0.5px] border-foreground/10">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-3">
                  <span 
                    className="text-3xl font-light text-foreground"
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' }}
                  >
                    {displayEnergy.toFixed(2)}
                  </span>
                  <span className="text-xs text-foreground/60  tracking-wider">Energy Field</span>
                </div>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Energy levels influence focus, emotional resonance, and fortune.
              </p>
            </div>
          )}
          
          <div className="relative" style={{ height }}>
          {/* SVG for paths only */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${width} ${height}`} 
            preserveAspectRatio="none"
            className="absolute inset-0 overflow-visible"
          >
            <defs>
              <linearGradient id="holographic-dynamic-horizontal" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={width} y2="0">
                {gradientStops.map((stop, i) => (
                  <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity="0.25" />
                ))}
                {gradientStops.length > 0 && (
                  <stop offset={gradientStops[gradientStops.length - 1].offset} stopColor={gradientStops[gradientStops.length - 1].color} stopOpacity="0" />
                )}
              </linearGradient>
            </defs>

            {/* Grid */}
            {[25, 50, 75].map((val) => (
              <line key={val} x1="0" y1={height - (val / maxValue) * height} x2={width} y2={height - (val / maxValue) * height} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.05" />
            ))}

            {showChart && (
              <>
                <path d={areaPathData} fill="url(#holographic-dynamic-horizontal)" className="animate-fade-in" />
                <path d={pastPathData} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                <path d={futurePathData} fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
              </>
            )}
          </svg>

          {/* HTML Overlay for dots to ensure 1:1 perfect circles and smooth pulsing */}
          {showChart && points.map((p, i) => {
            const isPast = p.hour < currentHour
            const isCurrent = p.hour === currentHour
            const isNext = p.hour === nextHour
            const isSelected = selectedHour === p.hour
            const isClickable = isPast || isCurrent || isNext
            
            return (
              <div key={i} className="absolute" style={{ 
                left: `${(p.hour / 24) * 100}%`, 
                top: `${100 - (p.value / maxValue) * 100}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 30 : (isNext ? 25 : 20),
              }}>
                {/* 倒计时气泡标签 - 跟随下一个时间点 */}
                {isNext && mode === "today" && (
                  <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in z-50" style={{ bottom: 'calc(100% + 20px)' }}>
                    <div className="relative bg-foreground text-background px-3 py-1.5 rounded-md shadow-sm flex items-center justify-center">
                      <span className="text-[10px] font-mono tracking-wider text-center">
                        {countdown}
                      </span>
                      {/* 气泡箭头 */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-foreground" />
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => isClickable && onSelectHour(isSelected ? null : p.hour)}
                  disabled={!isClickable}
                  className="flex items-center justify-center pointer-events-auto group relative"
                  style={{ 
                    cursor: isClickable ? 'pointer' : 'default'
                  }}
                >
                  {isCurrent && !isSelected && (
                    <div className="absolute w-6 h-6 rounded-full bg-foreground/10 sonar-pulse" />
                  )}
                  
                  {/* Hover ring */}
                  {isClickable && !isSelected && (
                    <div className="absolute w-4 h-4 rounded-full border-[0.5px] border-foreground/0 group-hover:border-foreground/20 transition-all" />
                  )}
                  
                  {/* Selected outer ring */}
                  {isSelected && (
                    <div className="absolute w-5 h-5 rounded-full border-[2px] border-foreground animate-fade-in" />
                  )}
                  
                  {/* Dot */}
                  <div className={`
                    rounded-full border-[1px] border-background transition-all duration-300
                    ${isSelected ? "w-2.5 h-2.5 bg-foreground scale-110" : isCurrent ? "w-2 h-2 bg-foreground" : "w-1.5 h-1.5"}
                    ${isPast || isCurrent ? "bg-foreground" : isNext ? "bg-foreground/30 border-foreground/10" : "bg-foreground/10 border-foreground/5"}
                    ${isClickable && !isSelected ? "group-hover:scale-125" : ""}
                  `} />
                </button>
              </div>
            )
          })}
        </div>

          <div className="flex justify-between mt-6 border-t-[0.5px] border-foreground/5 pt-3">
            {data.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d.hour} className="text-[8px] font-mono text-foreground tracking-tighter">
                {d.hour.toString().padStart(2, "0")}:00
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sonar {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .sonar-pulse {
          animation: sonar 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        /* 三张卡片独立的漂浮动画 */
        @keyframes card-float-0 {
          0%, 100% { transform: translateY(0) rotateY(0deg); }
          50% { transform: translateY(-${cardAnimParams[0]?.floatDistance || 8}px) rotateY(0deg); }
        }
        @keyframes card-float-1 {
          0%, 100% { transform: translateY(0) rotateY(0deg); }
          50% { transform: translateY(-${cardAnimParams[1]?.floatDistance || 8}px) rotateY(0deg); }
        }
        @keyframes card-float-2 {
          0%, 100% { transform: translateY(0) rotateY(0deg); }
          50% { transform: translateY(-${cardAnimParams[2]?.floatDistance || 8}px) rotateY(0deg); }
        }
        
        /* 丝滑的颜色变化动画 - 使用 hue-rotate */
        @keyframes card-hue-rotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        /* 卡片剧烈晃动动画 - 需要居中的卡片(左右两张) */
        @keyframes card-shake {
          0%, 100% { 
            transform: translateX(-50%) rotate(0deg) translateY(0); 
          }
          12.5% { 
            transform: translateX(calc(-50% + 3px)) rotate(-4deg) translateY(-3px); 
          }
          25% { 
            transform: translateX(calc(-50% - 4px)) rotate(5deg) translateY(2px); 
          }
          37.5% { 
            transform: translateX(calc(-50% + 2px)) rotate(-5deg) translateY(-2px); 
          }
          50% { 
            transform: translateX(calc(-50% - 3px)) rotate(4deg) translateY(3px); 
          }
          62.5% { 
            transform: translateX(calc(-50% + 4px)) rotate(-4deg) translateY(-2px); 
          }
          75% { 
            transform: translateX(calc(-50% - 2px)) rotate(3deg) translateY(2px); 
          }
          87.5% { 
            transform: translateX(calc(-50% + 2px)) rotate(-3deg) translateY(-1px); 
          }
        }
        
        /* 卡片剧烈晃动动画 - 中间卡片（不需要translateX偏移） */
        @keyframes card-shake-center {
          0%, 100% { 
            transform: rotate(0deg) translateY(0) translateX(0); 
          }
          12.5% { 
            transform: rotate(-4deg) translateY(-3px) translateX(3px); 
          }
          25% { 
            transform: rotate(5deg) translateY(2px) translateX(-4px); 
          }
          37.5% { 
            transform: rotate(-5deg) translateY(-2px) translateX(2px); 
          }
          50% { 
            transform: rotate(4deg) translateY(3px) translateX(-3px); 
          }
          62.5% { 
            transform: rotate(-4deg) translateY(-2px) translateX(4px); 
          }
          75% { 
            transform: rotate(3deg) translateY(2px) translateX(-2px); 
          }
          87.5% { 
            transform: rotate(-3deg) translateY(-1px) translateX(2px); 
          }
        }
        
        /* 卡片翻转动画 - 需要居中的卡片 */
        @keyframes card-flip {
          0% { 
            transform: translateX(-50%) rotateY(0deg); 
          }
          100% { 
            transform: translateX(-50%) rotateY(180deg); 
          }
        }
        
        /* 卡片翻转动画 - 中间卡片 */
        @keyframes card-flip-center {
          0% { 
            transform: rotateY(0deg); 
          }
          100% { 
            transform: rotateY(180deg); 
          }
        }
      `}</style>
    </div>
  )
}

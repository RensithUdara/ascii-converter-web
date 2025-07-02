"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Copy,
  ImageIcon,
  Settings,
  RefreshCw,
  Eye,
  Camera,
  Search,
  X,
  Grid3X3,
  Wand2,
  Palette,
  Monitor,
  CheckCircle,
  Info,
  Cpu,
  Layers,
  Filter,
  Download,
  Sliders,
  Zap,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  Minimize2,
} from "lucide-react"

interface ColoredChar {
  char: string
  color: string
}

interface ConversionSettings {
  width: number
  contrast: number
  brightness: number
  inverted: boolean
  grayscale: boolean
  charSet: string
  edgeDetection: boolean
  dithering: boolean
  aspectRatio: number
}

const unicodeBlocks = {
  "basic-latin": {
    name: "Basic Latin",
    description: "Standard ASCII characters",
    range: [0x0020, 0x007f],
  },
  "box-drawing": {
    name: "Box Drawing",
    description: "Line drawing characters",
    range: [0x2500, 0x257f],
  },
  "block-elements": {
    name: "Block Elements",
    description: "Block characters",
    range: [0x2580, 0x259f],
  },
  "geometric-shapes": {
    name: "Geometric Shapes",
    description: "Geometric symbols",
    range: [0x25a0, 0x25ff],
  },
}

const charSets = {
  standard: " .:-=+*#%@",
  detailed: " .,:;i!lI|=*+?#@",
  blocks: " ░▒▓█",
  minimal: " .#",
  binary: " 01",
  braille: " ⠁⠃⠇",
  geometric: " ▂▃",
  triangles: " ▲△▼",
  circles: " ○●◉",
  squares: " ▫▪◻",
  diamonds: " ◊◆💎",
  stars: " ✦★☆",
  hearts: " ♡💙💚",
  flowers: " 🌸🌺🌻",
  nature: " 🌱🌿🍀",
  faces: " 😐😊😃",
  animals: " 🐭🐱🐶",
  weather: " ☀️⛅☁️",
  arrows: " →↑←",
  math: " ∙○●",
  currency: " $€£¥",
  music: " ♪♫♬",
  cyberpunk: " ░▒▓█",
  retro: " .:oO@",
  matrix: " .:;|1",
  ascii_art: " .-=+*#%@&$",
  japanese: " ・。〇●",
  chinese: " 一丨丶",
  runic: " ᚠᚢᚦᚨ",
  binary_code: " 01",
  hex: " 0123456789ABCDEF",
  programming: " (){}[]<>/\\|",
  gaming: " ▲●■♦",
  waves: " ∼∽∿",
  spirals: " ◉◎○",
  fractals: " ∴∵∶",
  painterly: " ∙∘○●",
  custom: "",
}

const animationEffects = {
  none: "No Animation",
  typewriter: "Typewriter Effect",
  fadeIn: "Fade In",
  slideIn: "Slide In",
  matrix: "Matrix Rain",
  glitch: "Glitch Effect",
  wave: "Wave Effect",
  pulse: "Pulse Effect",
  rainbow: "Rainbow Colors",
  scanlines: "Scan Lines",
}

export default function AsciiConverter() {
  // State management
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [asciiArt, setAsciiArt] = useState<string>("")
  const [coloredAsciiArt, setColoredAsciiArt] = useState<ColoredChar[][]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewMode, setPreviewMode] = useState<"ascii" | "colored" | "original">("ascii")
  const [customCharSet, setCustomCharSet] = useState("")
  const [showUnicodeExplorer, setShowUnicodeExplorer] = useState(false)
  const [selectedUnicodeBlock, setSelectedUnicodeBlock] = useState("basic-latin")
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [unicodeSearchTerm, setUnicodeSearchTerm] = useState("")
  const [conversionProgress, setConversionProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Animation states
  const [animationEffect, setAnimationEffect] = useState<string>("none")
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(50)
  const [showParticles, setShowParticles] = useState(false)
  const [glitchIntensity, setGlitchIntensity] = useState(0.1)
  const [waveAmplitude, setWaveAmplitude] = useState(10)
  const [pulseSpeed, setPulseSpeed] = useState(1)
  const [matrixSpeed, setMatrixSpeed] = useState(100)
  const [enableSound, setEnableSound] = useState(false)
  const [showEffectsPanel, setShowEffectsPanel] = useState(false)

  // Settings
  const [settings, setSettings] = useState<ConversionSettings>({
    width: 80,
    contrast: 1,
    brightness: 1,
    inverted: false,
    grayscale: true,
    charSet: "standard",
    edgeDetection: false,
    dithering: false,
    aspectRatio: 0.5,
  })

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext>()

  const updateSetting = useCallback(<K extends keyof ConversionSettings>(key: K, value: ConversionSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Particle system for visual effects
  const createParticles = useCallback(() => {
    if (!showParticles || !particlesRef.current) return

    const particles = []
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div")
      particle.className = "absolute w-1 h-1 bg-blue-400 rounded-full opacity-70 animate-ping"
      particle.style.left = Math.random() * 100 + "%"
      particle.style.top = Math.random() * 100 + "%"
      particle.style.animationDelay = Math.random() * 2 + "s"
      particle.style.animationDuration = Math.random() * 3 + 1 + "s"
      particlesRef.current.appendChild(particle)
      particles.push(particle)
    }

    setTimeout(() => {
      particles.forEach((p) => p.remove())
    }, 5000)
  }, [showParticles])

  // Sound effects
  const playSound = useCallback(
    (frequency: number, duration: number) => {
      if (!enableSound) return

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.value = frequency
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    },
    [enableSound],
  )

  // Animation functions
  const startTypewriterEffect = useCallback(() => {
    if (!asciiArt) return

    setIsAnimating(true)
    const lines = asciiArt.split("\n")
    let currentLine = 0
    let currentChar = 0
    let displayText = ""

    const typeInterval = setInterval(() => {
      if (currentLine >= lines.length) {
        clearInterval(typeInterval)
        setIsAnimating(false)
        return
      }

      if (currentChar >= lines[currentLine].length) {
        displayText += "\n"
        currentLine++
        currentChar = 0
      } else {
        displayText += lines[currentLine][currentChar]
        currentChar++
        if (enableSound) playSound(800, 0.1)
      }

      // Update display (you would update a display state here)
    }, animationSpeed)

    return () => clearInterval(typeInterval)
  }, [asciiArt, animationSpeed, enableSound, playSound])

  const startMatrixEffect = useCallback(() => {
    if (!asciiArt) return

    setIsAnimating(true)
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"

    const matrixInterval = setInterval(() => {
      // Matrix rain effect logic would go here
      if (enableSound) playSound(400 + Math.random() * 200, 0.05)
    }, matrixSpeed)

    setTimeout(() => {
      clearInterval(matrixInterval)
      setIsAnimating(false)
    }, 10000)

    return () => clearInterval(matrixInterval)
  }, [asciiArt, matrixSpeed, enableSound, playSound])

  const startGlitchEffect = useCallback(() => {
    if (!asciiArt) return

    setIsAnimating(true)
    let glitchCount = 0

    const glitchInterval = setInterval(() => {
      if (glitchCount > 20) {
        clearInterval(glitchInterval)
        setIsAnimating(false)
        return
      }

      // Glitch effect logic
      if (enableSound && Math.random() < glitchIntensity) {
        playSound(100 + Math.random() * 1000, 0.1)
      }

      glitchCount++
    }, 100)

    return () => clearInterval(glitchInterval)
  }, [asciiArt, glitchIntensity, enableSound, playSound])

  const startAnimation = useCallback(() => {
    if (isAnimating) return

    createParticles()

    switch (animationEffect) {
      case "typewriter":
        startTypewriterEffect()
        break
      case "matrix":
        startMatrixEffect()
        break
      case "glitch":
        startGlitchEffect()
        break
      case "fadeIn":
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 2000)
        break
      case "pulse":
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 3000)
        break
      default:
        break
    }
  }, [animationEffect, isAnimating, createParticles, startTypewriterEffect, startMatrixEffect, startGlitchEffect])

  const stopAnimation = useCallback(() => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const getCharactersFromBlock = useCallback((blockKey: string): string[] => {
    const block = unicodeBlocks[blockKey as keyof typeof unicodeBlocks]
    if (!block) return []

    const characters: string[] = []
    const [start, end] = block.range
    const maxChars = 256
    const step = Math.max(1, Math.floor((end - start) / maxChars))

    for (let i = start; i <= end; i += step) {
      try {
        const char = String.fromCodePoint(i)
        if (char && char.trim() && !/[\u0000-\u001F\u007F-\u009F]/.test(char)) {
          characters.push(char)
        }
      } catch (e) {
        continue
      }
    }

    return characters
  }, [])

  const addCharacterToSelection = useCallback((char: string) => {
    setSelectedCharacters((prev) => {
      if (prev.includes(char)) {
        return prev.filter((c) => c !== char)
      } else {
        return [...prev, char]
      }
    })
  }, [])

  const buildCustomSetFromSelection = useCallback(() => {
    if (selectedCharacters.length === 0) return

    const sortedChars = [...selectedCharacters].sort((a, b) => {
      const densityA = a.charCodeAt(0)
      const densityB = b.charCodeAt(0)
      return densityA - densityB
    })

    const customSet = sortedChars.join("")
    setCustomCharSet(customSet)
    updateSetting("charSet", "custom")
    setShowUnicodeExplorer(false)
  }, [selectedCharacters, updateSetting])

  const filteredUnicodeBlocks = useMemo(() => {
    if (!unicodeSearchTerm) return Object.entries(unicodeBlocks)

    return Object.entries(unicodeBlocks).filter(
      ([key, block]) =>
        block.name.toLowerCase().includes(unicodeSearchTerm.toLowerCase()) ||
        block.description.toLowerCase().includes(unicodeSearchTerm.toLowerCase()),
    )
  }, [unicodeSearchTerm])

  const currentBlockCharacters = useMemo(() => {
    return getCharactersFromBlock(selectedUnicodeBlock)
  }, [selectedUnicodeBlock, getCharactersFromBlock])

  useEffect(() => {
    loadDefaultImage()
  }, [])

  useEffect(() => {
    if (image) {
      convertToAscii()
    }
  }, [image, settings, customCharSet])

  const loadDefaultImage = useCallback(() => {
    setLoading(true)
    setConversionProgress(0)
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      setImage(img)
      setLoading(false)
      setError(null)
      setConversionProgress(100)
    }

    img.onerror = () => {
      setError("Failed to load default image")
      setLoading(false)
      setConversionProgress(0)
    }

    img.src = "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop"
  }, [])

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB")
      return
    }

    setLoading(true)
    setConversionProgress(0)
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        setLoading(false)
        setError(null)
        setConversionProgress(100)
      }
      img.onerror = () => {
        setError("Failed to load image")
        setLoading(false)
        setConversionProgress(0)
      }
      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      setError("Failed to read file")
      setLoading(false)
      setConversionProgress(0)
    }

    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleImageUpload(files[0])
      }
    },
    [handleImageUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const applyImageFilters = useCallback(
    (imageData: ImageData): ImageData => {
      const data = imageData.data
      const { contrast, brightness, edgeDetection } = settings

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] * brightness))
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * brightness))
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * brightness))

        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128))
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128))
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128))
      }

      if (edgeDetection) {
        const width = imageData.width
        const height = imageData.height
        const newData = new Uint8ClampedArray(data)

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4

            const gx =
              -1 * data[((y - 1) * width + (x - 1)) * 4] +
              1 * data[((y - 1) * width + (x + 1)) * 4] +
              -2 * data[(y * width + (x - 1)) * 4] +
              2 * data[(y * width + (x + 1)) * 4] +
              -1 * data[((y + 1) * width + (x - 1)) * 4] +
              1 * data[((y + 1) * width + (x + 1)) * 4]

            const gy =
              -1 * data[((y - 1) * width + (x - 1)) * 4] +
              -2 * data[((y - 1) * width + x) * 4] +
              -1 * data[((y - 1) * width + (x + 1)) * 4] +
              1 * data[((y + 1) * width + (x - 1)) * 4] +
              2 * data[((y + 1) * width + x) * 4] +
              1 * data[((y + 1) * width + (x + 1)) * 4]

            const magnitude = Math.sqrt(gx * gx + gy * gy)
            newData[idx] = newData[idx + 1] = newData[idx + 2] = Math.min(255, magnitude)
          }
        }

        for (let i = 0; i < data.length; i++) {
          data[i] = newData[i]
        }
      }

      return imageData
    },
    [settings],
  )

  const convertToAscii = useCallback(() => {
    if (!image || !canvasRef.current) return

    setLoading(true)
    setIsProcessing(true)
    setConversionProgress(0)

    const progressInterval = setInterval(() => {
      setConversionProgress((prev) => Math.min(prev + 8, 95))
    }, 40)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      const { width, grayscale, charSet, inverted, dithering, aspectRatio } = settings
      const chars =
        settings.charSet === "custom" && customCharSet
          ? customCharSet
          : charSets[settings.charSet as keyof typeof charSets]

      const aspectRatioCorrection = aspectRatio
      const targetWidth = width
      const targetHeight = Math.floor((image.height / image.width) * targetWidth * aspectRatioCorrection)

      canvas.width = image.width
      canvas.height = image.height

      ctx.drawImage(image, 0, 0)
      let imageData = ctx.getImageData(0, 0, image.width, image.height)

      imageData = applyImageFilters(imageData)

      const data = imageData.data
      const widthStep = image.width / targetWidth
      const heightStep = image.height / targetHeight

      let result = ""
      const coloredResult: ColoredChar[][] = []

      const ditherMatrix = dithering
        ? [
            [0, 0, 7 / 16],
            [3 / 16, 5 / 16, 1 / 16],
          ]
        : null

      for (let y = 0; y < targetHeight; y++) {
        const coloredRow: ColoredChar[] = []

        for (let x = 0; x < targetWidth; x++) {
          const pixelX = Math.floor(x * widthStep)
          const pixelY = Math.floor(y * heightStep)
          const pos = (pixelY * image.width + pixelX) * 4

          const r = data[pos] || 0
          const g = data[pos + 1] || 0
          const b = data[pos + 2] || 0

          let brightness = grayscale
            ? (r * 0.299 + g * 0.587 + b * 0.114) / 255
            : Math.sqrt(0.299 * (r / 255) ** 2 + 0.587 * (g / 255) ** 2 + 0.114 * (b / 255) ** 2)

          if (inverted) brightness = 1 - brightness

          if (ditherMatrix && x < targetWidth - 1 && y < targetHeight - 1) {
            const quantError = brightness - Math.round(brightness * (chars.length - 1)) / (chars.length - 1)
            brightness += quantError * 0.1
          }

          brightness = Math.max(0, Math.min(1, brightness))

          const charIndex = Math.floor(brightness * (chars.length - 1))
          const char = chars[charIndex] || " "

          result += char

          const color = grayscale
            ? `rgb(${Math.floor(brightness * 255)}, ${Math.floor(brightness * 255)}, ${Math.floor(brightness * 255)})`
            : `rgb(${r}, ${g}, ${b})`

          coloredRow.push({ char, color })
        }

        result += "\n"
        coloredResult.push(coloredRow)
      }

      clearInterval(progressInterval)
      setConversionProgress(100)
      setAsciiArt(result)
      setColoredAsciiArt(coloredResult)
      setError(null)

      // Play completion sound
      if (enableSound) playSound(600, 0.3)
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : "Conversion failed")
      setConversionProgress(0)
    } finally {
      setLoading(false)
      setIsProcessing(false)
    }
  }, [image, settings, applyImageFilters, customCharSet, enableSound, playSound])

  const copyToClipboard = useCallback(async () => {
    if (!asciiArt) return

    try {
      await navigator.clipboard.writeText(asciiArt)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
      if (enableSound) playSound(800, 0.2)
    } catch (err) {
      const textArea = document.createElement("textarea")
      textArea.value = asciiArt
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
      if (enableSound) playSound(800, 0.2)
    }
  }, [asciiArt, enableSound, playSound])

  const downloadAscii = useCallback(() => {
    if (!asciiArt) return

    const blob = new Blob([asciiArt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ascii-art.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    if (enableSound) playSound(500, 0.3)
  }, [asciiArt, enableSound, playSound])

  const downloadAsImage = useCallback(() => {
    if (!outputCanvasRef.current || !asciiArt) return

    const canvas = outputCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const fontSize = 8
    const lineHeight = fontSize * 1.2
    const charWidth = fontSize * 0.6

    const lines = asciiArt.split("\n")
    const maxWidth = Math.max(...lines.map((line) => line.length))

    canvas.width = maxWidth * charWidth
    canvas.height = lines.length * lineHeight

    ctx.fillStyle = settings.grayscale ? "black" : "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = `${fontSize}px monospace`
    ctx.textBaseline = "top"
    ctx.fillStyle = settings.grayscale ? "white" : "black"

    lines.forEach((line, i) => {
      ctx.fillText(line, 0, i * lineHeight)
    })

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "ascii-art.png"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      if (enableSound) playSound(500, 0.3)
    })
  }, [asciiArt, settings.grayscale, enableSound, playSound])

  const UnicodeExplorer = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden transform animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3X3 className="h-6 w-6 text-blue-600 animate-pulse" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Unicode Block Explorer</h2>
                <p className="text-gray-600 text-sm">Select characters for your custom character set</p>
              </div>
            </div>
            <Button
              onClick={() => setShowUnicodeExplorer(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 hover:bg-red-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Unicode blocks..."
                  value={unicodeSearchTerm}
                  onChange={(e) => setUnicodeSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredUnicodeBlocks.map(([key, block]) => (
                <div
                  key={key}
                  onClick={() => setSelectedUnicodeBlock(key)}
                  className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-gray-100 transition-all duration-200 transform hover:scale-[1.02] ${
                    selectedUnicodeBlock === key ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-sm" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">{block.name}</div>
                  <div className="text-gray-600 text-sm mt-1">{block.description}</div>
                  <div className="text-gray-500 text-xs mt-2 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                    U+{block.range[0].toString(16).toUpperCase().padStart(4, "0")} - U+
                    {block.range[1].toString(16).toUpperCase().padStart(4, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {unicodeBlocks[selectedUnicodeBlock as keyof typeof unicodeBlocks]?.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {unicodeBlocks[selectedUnicodeBlock as keyof typeof unicodeBlocks]?.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-gray-600 text-sm">Selected</div>
                  <div className="text-2xl font-bold text-blue-600 animate-pulse">{selectedCharacters.length}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-16 gap-2">
                {currentBlockCharacters.map((char, index) => (
                  <button
                    key={index}
                    onClick={() => addCharacterToSelection(char)}
                    className={`w-10 h-10 border rounded text-center font-mono text-sm transition-all duration-200 transform hover:scale-110 hover:rotate-3 ${
                      selectedCharacters.includes(char)
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg animate-pulse"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:border-blue-400"
                    }`}
                    title={`U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="text-gray-600 text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 animate-bounce" />
                  Click characters to select/deselect them
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedCharacters([])}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear Selection
                  </Button>
                  <Button
                    onClick={buildCustomSetFromSelection}
                    disabled={selectedCharacters.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-200"
                  >
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Use Selected ({selectedCharacters.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const EffectsPanel = () => (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 opacity-50" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          Effects & Animations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        {/* Animation Effect Selection */}
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Animation Effect
          </Label>
          <Select value={animationEffect} onValueChange={setAnimationEffect}>
            <SelectTrigger className="border-purple-200 focus:border-purple-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(animationEffects).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Animation Controls */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={startAnimation}
              disabled={isAnimating || !asciiArt}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white transform hover:scale-105 transition-all"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Animation
            </Button>
            <Button
              onClick={stopAnimation}
              disabled={!isAnimating}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <Pause className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>
        </div>

        {/* Animation Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-gray-700 font-medium">Animation Speed</Label>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {animationSpeed}ms
            </Badge>
          </div>
          <Slider
            value={[animationSpeed]}
            onValueChange={([value]) => setAnimationSpeed(value)}
            min={10}
            max={200}
            step={10}
            className="w-full"
          />
        </div>

        {/* Effect-specific controls */}
        {animationEffect === "glitch" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium">Glitch Intensity</Label>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {(glitchIntensity * 100).toFixed(0)}%
              </Badge>
            </div>
            <Slider
              value={[glitchIntensity]}
              onValueChange={([value]) => setGlitchIntensity(value)}
              min={0.01}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
        )}

        {animationEffect === "wave" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium">Wave Amplitude</Label>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {waveAmplitude}px
              </Badge>
            </div>
            <Slider
              value={[waveAmplitude]}
              onValueChange={([value]) => setWaveAmplitude(value)}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {animationEffect === "pulse" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium">Pulse Speed</Label>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {pulseSpeed}x
              </Badge>
            </div>
            <Slider
              value={[pulseSpeed]}
              onValueChange={([value]) => setPulseSpeed(value)}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        )}

        {animationEffect === "matrix" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium">Matrix Speed</Label>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {matrixSpeed}ms
              </Badge>
            </div>
            <Slider
              value={[matrixSpeed]}
              onValueChange={([value]) => setMatrixSpeed(value)}
              min={50}
              max={500}
              step={10}
              className="w-full"
            />
          </div>
        )}

        {/* Visual Effects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <Label className="text-gray-700 font-medium">Show Particles</Label>
            </div>
            <Switch checked={showParticles} onCheckedChange={setShowParticles} />
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-blue-600" />
              <Label className="text-gray-700 font-medium">Sound Effects</Label>
            </div>
            <Switch checked={enableSound} onCheckedChange={setEnableSound} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Particles container */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />

      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-pulse">
            ASCII Art Converter
          </h1>
          <p className="text-gray-600 text-lg">Convert images to ASCII art with stunning effects and animations</p>

          {/* Status Bar */}
          {(loading || isProcessing) && (
            <div className="max-w-md mx-auto mt-6">
              <div className="flex items-center gap-3 mb-3 justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-gradient-to-r from-blue-500 to-purple-500 border-t-transparent" />
                <span className="text-gray-600 font-medium text-lg">
                  {isProcessing ? "Processing image..." : "Converting image..."}
                </span>
              </div>
              <Progress value={conversionProgress} className="h-3 bg-gradient-to-r from-blue-200 to-purple-200" />
              <div className="text-center text-gray-500 text-sm mt-2 animate-pulse">{conversionProgress}% Complete</div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5 text-indigo-600 animate-bounce" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 transform ${
                    isDragging
                      ? "border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 scale-105 shadow-lg"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:scale-102"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <ImageIcon className={`h-12 w-12 mx-auto mb-4 text-gray-400 ${isDragging ? "animate-bounce" : ""}`} />
                  <p className="text-gray-600 mb-2 font-medium">Drag & drop an image</p>
                  <p className="text-gray-500 text-sm mb-4">or click to browse</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-200"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-green-600 animate-spin" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic" className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Basic
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      Advanced
                    </TabsTrigger>
                    <TabsTrigger value="effects" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Effects
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-6">
                    {/* Width Control */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-blue-500" />
                          Width
                        </Label>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 animate-pulse"
                        >
                          {settings.width} chars
                        </Badge>
                      </div>
                      <Slider
                        value={[settings.width]}
                        onValueChange={([value]) => updateSetting("width", value)}
                        min={20}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Character Set */}
                    <div className="space-y-3">
                      <Label className="text-gray-700 font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4 text-purple-500" />
                        Character Set
                      </Label>
                      <Select value={settings.charSet} onValueChange={(value) => updateSetting("charSet", value)}>
                        <SelectTrigger className="border-purple-200 focus:border-purple-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="blocks">Blocks</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="custom">Custom Set</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Unicode Explorer Button */}
                    <Button
                      onClick={() => setShowUnicodeExplorer(true)}
                      variant="outline"
                      className="w-full border-teal-600 text-teal-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 transform hover:scale-105 transition-all duration-200"
                    >
                      <Grid3X3 className="h-4 w-4 mr-2 animate-pulse" />
                      Browse Unicode Blocks
                    </Button>

                    {/* Character Set Preview */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        Preview
                      </Label>
                      <div className="bg-gradient-to-r from-gray-100 to-blue-100 p-4 rounded-lg text-gray-900 font-mono text-sm border transform hover:scale-105 transition-all">
                        {charSets[settings.charSet as keyof typeof charSets] || customCharSet || "Custom set"}
                      </div>
                    </div>

                    {/* Custom Character Set Input */}
                    {settings.charSet === "custom" && (
                      <div className="space-y-3">
                        <Label className="text-gray-700 font-medium">Custom Characters</Label>
                        <input
                          type="text"
                          value={customCharSet}
                          onChange={(e) => setCustomCharSet(e.target.value)}
                          placeholder="Enter characters from light to dark..."
                          className="w-full border border-purple-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Info className="h-3 w-3 animate-bounce" />
                          Enter characters from lightest to darkest
                        </p>
                      </div>
                    )}

                    {/* Toggle Controls */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg transform hover:scale-105 transition-all">
                        <div className="flex items-center gap-3">
                          <Palette className="h-4 w-4 text-purple-600" />
                          <Label className="text-gray-700 font-medium">Grayscale Mode</Label>
                        </div>
                        <Switch
                          checked={settings.grayscale}
                          onCheckedChange={(checked) => updateSetting("grayscale", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg transform hover:scale-105 transition-all">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-4 w-4 text-blue-600" />
                          <Label className="text-gray-700 font-medium">Invert Colors</Label>
                        </div>
                        <Switch
                          checked={settings.inverted}
                          onCheckedChange={(checked) => updateSetting("inverted", checked)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6 mt-6">
                    {/* Advanced Controls */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4 text-orange-500" />
                            Contrast
                          </Label>
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700"
                          >
                            {settings.contrast.toFixed(1)}
                          </Badge>
                        </div>
                        <Slider
                          value={[settings.contrast]}
                          onValueChange={([value]) => updateSetting("contrast", value)}
                          min={0.5}
                          max={3}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Brightness
                          </Label>
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700"
                          >
                            {settings.brightness.toFixed(1)}
                          </Badge>
                        </div>
                        <Slider
                          value={[settings.brightness]}
                          onValueChange={([value]) => updateSetting("brightness", value)}
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 font-medium flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-green-500" />
                            Aspect Ratio
                          </Label>
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700"
                          >
                            {settings.aspectRatio.toFixed(1)}
                          </Badge>
                        </div>
                        <Slider
                          value={[settings.aspectRatio]}
                          onValueChange={([value]) => updateSetting("aspectRatio", value)}
                          min={0.3}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Advanced Toggles */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg transform hover:scale-105 transition-all">
                          <Label className="text-gray-700 font-medium flex items-center gap-2">
                            <Layers className="h-4 w-4 text-indigo-600" />
                            Edge Detection
                          </Label>
                          <Switch
                            checked={settings.edgeDetection}
                            onCheckedChange={(checked) => updateSetting("edgeDetection", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg transform hover:scale-105 transition-all">
                          <Label className="text-gray-700 font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4 text-pink-600" />
                            Dithering
                          </Label>
                          <Switch
                            checked={settings.dithering}
                            onCheckedChange={(checked) => updateSetting("dithering", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="effects" className="mt-6">
                    <EffectsPanel />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5 text-emerald-600 animate-bounce" />
                  Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={copyToClipboard}
                  disabled={!asciiArt || loading}
                  className="w-full text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy ASCII Art
                    </>
                  )}
                </Button>
                <Button
                  onClick={downloadAscii}
                  disabled={!asciiArt || loading}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 bg-transparent transform hover:scale-105 transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download TXT
                </Button>
                <Button
                  onClick={downloadAsImage}
                  disabled={!asciiArt || loading}
                  variant="outline"
                  className="w-full border-purple-600 text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 bg-transparent transform hover:scale-105 transition-all duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
                <Button
                  onClick={loadDefaultImage}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-orange-600 text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 bg-transparent transform hover:scale-105 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-3">
            <Card className="h-full transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5 text-cyan-600 animate-pulse" />
                    Preview
                    <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="ghost" size="sm" className="ml-2">
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                  <div className="flex gap-2">
                    {["original", "ascii", "colored"].map((mode) => (
                      <Badge
                        key={mode}
                        variant={previewMode === mode ? "default" : "secondary"}
                        className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                          previewMode === mode
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-pulse"
                            : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-blue-200"
                        }`}
                        onClick={() => setPreviewMode(mode as typeof previewMode)}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className={`${isFullscreen ? "h-[80vh]" : "h-[600px]"} overflow-auto relative`}>
                {(loading || isProcessing) && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                      <div className="h-8 w-8 bg-white rounded-full m-2"></div>
                    </div>
                    <div className="text-gray-600 text-lg font-medium animate-pulse">
                      {isProcessing ? "Processing image..." : "Converting image..."}
                    </div>
                    <div className="w-64">
                      <Progress value={conversionProgress} className="h-3" />
                      <div className="text-center text-gray-500 text-sm mt-2 animate-bounce">
                        {conversionProgress}% Complete
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="text-red-500 animate-bounce">
                      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <div className="text-red-600 text-center">
                      <p className="text-lg font-medium mb-2">{error}</p>
                      <Button
                        onClick={loadDefaultImage}
                        variant="outline"
                        className="border-red-300 text-red-600 bg-transparent hover:bg-red-50 transform hover:scale-105 transition-all"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Load Default Image
                      </Button>
                    </div>
                  </div>
                )}

                {!loading && !error && !isProcessing && (
                  <div className="h-full flex items-center justify-center p-4">
                    {previewMode === "original" && image && (
                      <div className="relative group">
                        <img
                          src={image.src || "/placeholder.svg"}
                          alt="Original"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-md border transform group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      </div>
                    )}

                    {previewMode === "ascii" && asciiArt && (
                      <pre
                        className={`text-gray-900 font-mono text-xs leading-none whitespace-pre overflow-auto bg-white p-6 rounded-lg shadow-md border max-w-full max-h-full transform hover:scale-105 transition-all duration-300 ${
                          animationEffect === "typewriter" && isAnimating ? "animate-pulse" : ""
                        } ${animationEffect === "fadeIn" && isAnimating ? "animate-fade-in" : ""} ${
                          animationEffect === "glitch" && isAnimating ? "animate-pulse" : ""
                        } ${animationEffect === "pulse" && isAnimating ? "animate-ping" : ""}`}
                        style={{
                          animationDuration: animationEffect === "pulse" ? `${1 / pulseSpeed}s` : undefined,
                          filter:
                            animationEffect === "glitch" && isAnimating ? "hue-rotate(90deg) saturate(2)" : undefined,
                        }}
                      >
                        {asciiArt}
                      </pre>
                    )}

                    {previewMode === "colored" && coloredAsciiArt.length > 0 && (
                      <div
                        className={`font-mono text-xs leading-none bg-white p-6 rounded-lg shadow-md border overflow-auto max-w-full max-h-full transform hover:scale-105 transition-all duration-300 ${
                          animationEffect === "rainbow" && isAnimating ? "animate-pulse" : ""
                        } ${animationEffect === "wave" && isAnimating ? "animate-bounce" : ""}`}
                        style={{
                          filter: animationEffect === "rainbow" && isAnimating ? "hue-rotate(0deg)" : undefined,
                          animation:
                            animationEffect === "rainbow" && isAnimating ? "rainbow 3s linear infinite" : undefined,
                        }}
                      >
                        {coloredAsciiArt.map((row, i) => (
                          <div key={i} className="whitespace-nowrap">
                            {row.map((col, j) => (
                              <span
                                key={j}
                                style={{
                                  color: col.color,
                                  transform:
                                    animationEffect === "wave" && isAnimating
                                      ? `translateY(${Math.sin((i + j) * 0.1) * waveAmplitude}px)`
                                      : undefined,
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                {col.char}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Animation status indicator */}
                {isAnimating && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    <Sparkles className="h-4 w-4 inline mr-1" />
                    {animationEffects[animationEffect as keyof typeof animationEffects]} Active
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden canvases */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={outputCanvasRef} className="hidden" />

        {/* Unicode Explorer Modal */}
        {showUnicodeExplorer && <UnicodeExplorer />}

        {/* Success Toast */}
        {copySuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all">
              <CheckCircle className="h-5 w-5 animate-spin" />
              <span className="font-medium">ASCII art copied to clipboard!</span>
            </div>
          </div>
        )}

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            25% { filter: hue-rotate(90deg); }
            50% { filter: hue-rotate(180deg); }
            75% { filter: hue-rotate(270deg); }
            100% { filter: hue-rotate(360deg); }
          }
          
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          .animate-fade-in {
            animation: fadeIn 2s ease-in-out;
          }
          
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Palette colors
const TEAL = '#00BFA6'
const CORAL = '#FF6B5E'
const GOLDEN = '#FFC857'
const SOFT_MINT = '#D9F5EA'
const MIDNIGHT = '#14213D'

function NetworkNode({ position, color, scale = 1 }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.18
      ref.current.rotation.y += 0.01
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.14 * scale, 24, 24]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.35}
      />
    </mesh>
  )
}

function ConnectionLine({ start, end, color = TEAL }) {
  const ref = useRef()
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.4} linewidth={1} />
    </line>
  )
}

function Particles({ count = 120 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={TEAL} transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

function FloatingGeo({ position, color, type = 'octahedron' }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.4
      ref.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })
  const Geo = type === 'octahedron' ? 'octahedronGeometry' : type === 'torus' ? 'torusGeometry' : 'icosahedronGeometry'
  const args = type === 'torus' ? [0.18, 0.05, 12, 24] : [0.14, 0]

  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.7}>
      <mesh ref={ref} position={position}>
        <Geo args={args} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.7}
          wireframe={type === 'icosahedron'}
          emissive={color}
          emissiveIntensity={0.25}
        />
      </mesh>
    </Float>
  )
}

function CameraRig() {
  const { camera, pointer } = useThree()
  useFrame(() => {
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function HeroScene() {
  const nodes = useMemo(() => [
    { position: [-2.2, 0.6, -0.5], color: TEAL, scale: 1.3 },
    { position: [-0.9, 1.4, 0.2], color: SOFT_MINT, scale: 1.0 },
    { position: [0.3, 0.2, -0.8], color: CORAL, scale: 1.4 },
    { position: [1.8, 1.1, 0.4], color: TEAL, scale: 1.1 },
    { position: [2.5, -0.4, -0.2], color: GOLDEN, scale: 1.2 },
    { position: [-1.4, -1.0, 0.1], color: CORAL, scale: 1.1 },
    { position: [0.9, -1.2, 0.3], color: TEAL, scale: 1.3 },
    { position: [-2.8, -0.5, -0.9], color: SOFT_MINT, scale: 0.9 },
    { position: [2.1, -1.3, -0.6], color: SOFT_MINT, scale: 0.9 },
  ], [])

  const connections = useMemo(() => [
    [nodes[0].position, nodes[1].position],
    [nodes[1].position, nodes[2].position],
    [nodes[2].position, nodes[3].position],
    [nodes[3].position, nodes[4].position],
    [nodes[0].position, nodes[5].position],
    [nodes[5].position, nodes[6].position],
    [nodes[6].position, nodes[4].position],
    [nodes[2].position, nodes[6].position],
    [nodes[0].position, nodes[7].position],
    [nodes[4].position, nodes[8].position],
  ], [nodes])

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color={TEAL} />
        <pointLight position={[-5, -3, 3]} intensity={1.0} color={CORAL} />
        <directionalLight position={[0, 4, 2]} intensity={0.8} />

        <CameraRig />
        <Particles count={100} />

        {nodes.map((node, i) => (
          <NetworkNode key={i} position={node.position} color={node.color} scale={node.scale} />
        ))}

        {connections.map((conn, i) => (
          <ConnectionLine key={i} start={conn[0]} end={conn[1]} color={i % 2 === 0 ? TEAL : CORAL} />
        ))}

        <FloatingGeo position={[-3, 1.6, -1]} color={TEAL} type="octahedron" />
        <FloatingGeo position={[3.2, 1.2, -1.2]} color={CORAL} type="icosahedron" />
        <FloatingGeo position={[1.5, -2, -0.5]} color={GOLDEN} type="torus" />
        <FloatingGeo position={[-2.4, -1.8, -0.8]} color={SOFT_MINT} type="octahedron" />
      </Canvas>
    </div>
  )
}

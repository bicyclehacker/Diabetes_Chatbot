'use client';

import { OrbitControls, Float, Environment } from '@react-three/drei';
import { Suspense } from 'react';

function MedicalScene() {
    return (
        <>
            {/* This is all perfect 3D content */}
            <Environment preset="studio" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Floating Medical Icons */}
            <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                <mesh position={[-2, 1, 0]}>
                    <boxGeometry args={[0.8, 0.8, 0.8]} />
                    <meshStandardMaterial color="#3b82f6" />
                </mesh>
            </Float>

            <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
                <mesh position={[2, -1, 0]}>
                    <sphereGeometry args={[0.6]} />
                    <meshStandardMaterial color="#8b5cf6" />
                </mesh>
            </Float>

            <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2.5}>
                <mesh position={[0, 2, -1]}>
                    <cylinderGeometry args={[0.4, 0.4, 1.2]} />
                    <meshStandardMaterial color="#10b981" />
                </mesh>
            </Float>

            <Float speed={1.2} rotationIntensity={1.2} floatIntensity={1.8}>
                <mesh position={[-1, -2, 1]}>
                    <octahedronGeometry args={[0.7]} />
                    <meshStandardMaterial color="#f59e0b" />
                </mesh>
            </Float>

            <Float speed={2.2} rotationIntensity={0.6} floatIntensity={2.2}>
                <mesh position={[1.5, 0.5, 2]}>
                    <torusGeometry args={[0.5, 0.2]} />
                    <meshStandardMaterial color="#ef4444" />
                </mesh>
            </Float>

            {/* Central Health Symbol */}
            <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                <group position={[0, 0, 0]}>
                    <mesh>
                        <boxGeometry args={[0.3, 1.5, 0.3]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                    <mesh>
                        <boxGeometry args={[1.5, 0.3, 0.3]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                </group>
            </Float>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={2}
            />
        </>
    );
}

// ✅ THIS IS THE FIX
export function Hero3D() {
    // Return the 3D scene directly.
    // The <Canvas> in HomePage.tsx will render this.
    return (
        <Suspense fallback={null}>
            <MedicalScene />
        </Suspense>
    );
}

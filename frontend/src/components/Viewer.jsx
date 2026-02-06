import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';

function Model({ url }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

export default function Viewer({ modelUrl }) {
    return (
        <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
            {!modelUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <p>No model generated yet.</p>
                </div>
            )}
            <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        {modelUrl && <Model url={modelUrl} key={modelUrl} />}
                    </Stage>
                </Suspense>
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}

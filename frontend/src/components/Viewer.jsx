import React, { Suspense, forwardRef, useImperativeHandle, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';

function Model({ url }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

// Internal component to access three context
function CaptureHandler({ captureRef }) {
    const { gl, scene, camera } = useThree();

    useImperativeHandle(captureRef, () => ({
        captureSnapshot: () => {
            gl.render(scene, camera);
            return gl.domElement.toDataURL('image/jpeg', 0.8);
        }
    }));
    return null;
}

const Viewer = forwardRef(({ modelUrl }, ref) => {
    return (
        <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
            {!modelUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <p>No model generated yet.</p>
                </div>
            )}
            <Canvas
                shadows
                gl={{ preserveDrawingBuffer: true }}
                camera={{ position: [0, 0, 150], fov: 50 }}
            >
                <CaptureHandler captureRef={ref} />
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        {modelUrl && <Model url={modelUrl} key={modelUrl} />}
                    </Stage>
                </Suspense>
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
});

export default Viewer;

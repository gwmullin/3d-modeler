import React from 'react';
import { Box, Sparkles, Code, Download, ArrowRight } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
    return (
        <div className="min-h-screen bg-gray-900 text-white selection:bg-blue-500 selection:text-white overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Box className="w-8 h-8 text-blue-500" />
                        <span className="font-bold text-xl tracking-tight">CadQuery GenAI</span>
                    </div>
                    <button
                        onClick={onGetStarted}
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        Start App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                        <Sparkles size={14} />
                        <span>AI-Powered 3D Modeling</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                        Turn Ideas into <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Parametric 3D Models
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Describe your shape in plain English and let our AI generate precise CadQuery code.
                        Visualize, iterate, and export for manufacturing in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={onGetStarted}
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                        >
                            Start Modeling
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="https://cadquery.readthedocs.io/"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-semibold text-lg border border-gray-700 transition-all flex items-center justify-center"
                        >
                            Documentation
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Code className="w-8 h-8 text-green-400" />}
                            title="Code-Based Precision"
                            description="Generates valid Python/CadQuery code that you can inspect, modify, and reuse in your own pipelines."
                        />
                        <FeatureCard
                            icon={<Box className="w-8 h-8 text-blue-400" />}
                            title="Instant Visualization"
                            description="See your model render in real-time within the browser. Rotate, zoom, and inspect every detail."
                        />
                        <FeatureCard
                            icon={<Download className="w-8 h-8 text-purple-400" />}
                            title="Export Ready"
                            description="Download your designs as STL or STEP files ready for 3D printing or CNC machining."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
                    <p>© 2024 CadQuery GenAI. Open Source Software.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-8 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="bg-gray-700/50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-100">{title}</h3>
            <p className="text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

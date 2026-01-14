import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { RefreshCw, ShieldAlert } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-full max-w-md border-[4px] border-black p-12 space-y-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-center">
                            <ShieldAlert className="w-20 h-20 text-black" strokeWidth={2.5} />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-black uppercase tracking-tighter italic">CATASTROPHIC FAILURE</h1>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-black/40">Fragmented session detected. Protection protocols engaged.</p>
                        </div>

                        <div className="h-[1px] bg-black/10 w-full" />

                        <p className="text-sm font-medium leading-relaxed">
                            The application encountered an irrecoverable state. This is often caused by fragmented data or relay desync.
                        </p>

                        <Button
                            onClick={() => window.location.assign('/')}
                            className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-none uppercase text-xs font-black tracking-widest border border-black transition-all active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reboot Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

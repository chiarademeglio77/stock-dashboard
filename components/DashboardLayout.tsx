export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
            <header className="bg-white sticky top-0 z-50 border-b border-slate-200">
                <div className="w-full px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-all">
                            <span className="text-slate-900 font-black text-xl">C</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-[0.2em] uppercase leading-none text-foreground">Chiara</span>
                            <span className="font-bold text-[10px] tracking-[0.4em] uppercase text-primary/80 leading-none mt-1">Finance Terminal</span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 w-full px-8 py-10 mx-auto max-w-[1800px]">
                {children}
            </main>
            <footer className="py-10 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/50">
                    Proprietary Algorithm © 2025 Chiara Intelligence
                </p>
            </footer>
        </div>
    );
}

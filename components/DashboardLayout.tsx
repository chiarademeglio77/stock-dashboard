export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="w-full px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold">H</span>
                        </div>
                        <span className="font-semibold text-lg">Historical Dashboard</span>
                    </div>
                    <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">Overview</a>
                        <a href="#" className="hover:text-foreground transition-colors">Markets</a>
                        <a href="#" className="hover:text-foreground transition-colors">Analysis</a>
                    </nav>
                </div>
            </header>
            <main className="flex-1 w-full px-6 py-8 mx-auto">
                {children}
            </main>
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                © 2025 Historical Data Systems
            </footer>
        </div>
    );
}

import { ArrowUp, ArrowDown } from 'lucide-react';


interface MetricsCardProps {
    title: string;
    value: string;
    change?: number;
    changeLabel?: string;
    secondaryChange?: number;
    secondaryLabel?: string;
    icon?: React.ReactNode;
}

export function MetricsCard({ title, value, change, changeLabel, secondaryChange, secondaryLabel, icon }: MetricsCardProps) {
    const isPositive = change && change >= 0;
    const isSecondaryPositive = secondaryChange && secondaryChange >= 0;

    return (
        <div className="glass-card p-6 hover:border-primary/50 transition-all group overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full -z-10 group-hover:bg-slate-100 transition-colors" />

            <div className="flex flex-row items-center justify-between space-y-0 pb-0.5 relative z-10">
                <h3 className="tracking-widest text-[8px] uppercase font-bold text-muted-foreground">{title}</h3>
                {icon && <div className="text-muted-foreground/50 group-hover:text-primary transition-colors">{icon}</div>}
            </div>
            <div className="content relative z-10">
                <div className="text-xl font-black tracking-tighter text-slate-900">{value}</div>
                <div className="flex gap-4 mt-2">
                    {change !== undefined && (
                        <p className="text-xs flex items-center">
                            <span className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {isPositive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                                {Math.abs(change).toFixed(2)}%
                            </span>
                            <span className="ml-1.5 text-[8px] text-muted-foreground font-medium uppercase tracking-wider">{changeLabel}</span>
                        </p>
                    )}
                    {secondaryChange !== undefined && (
                        <p className="text-xs flex items-center border-l border-border/20 pl-4">
                            <span className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded ${isSecondaryPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {Math.abs(secondaryChange).toFixed(2)}%
                            </span>
                            <span className="ml-1.5 text-[8px] text-primary/60 font-medium uppercase tracking-wider">{secondaryLabel}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

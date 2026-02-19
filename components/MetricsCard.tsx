import { ArrowUp, ArrowDown } from 'lucide-react';


interface MetricsCardProps {
    title: string;
    value: string;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
}

export function MetricsCard({ title, value, change, changeLabel, icon }: MetricsCardProps) {
    const isPositive = change && change >= 0;

    return (
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">{title}</h3>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
            <div className="content">
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        {isPositive ? (
                            <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                        ) : (
                            <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} text-base font-bold`}>
                            {Math.abs(change).toFixed(2)}%
                        </span>
                        <span className="ml-1">{changeLabel}</span>
                    </p>
                )}
            </div>
        </div>
    );
}

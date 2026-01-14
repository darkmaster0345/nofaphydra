import { useState, useEffect } from 'react';
import { getActivityLog, ActivityEntry, getActivityIcon } from '@/lib/activityLog';
import { formatDistanceToNow } from 'date-fns';
import { History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActivityHistory() {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadActivities = () => {
        setLoading(true);
        const log = getActivityLog();
        setActivities(log);
        setLoading(false);
    };

    useEffect(() => {
        loadActivities();

        // Listen for storage changes (cross-tab sync)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'hydra_activity_log') {
                loadActivities();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className="border border-black bg-white animate-in fade-in duration-500">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Activity Log
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadActivities}
                    className="h-6 w-6 text-white hover:bg-white/20 rounded-none"
                >
                    <RefreshCw className="w-3 h-3" />
                </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-black/30">Loading...</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="p-8 text-center border-t border-dashed border-black/10">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-black/20">
                            No activity recorded yet
                        </p>
                        <p className="text-[9px] text-black/30 mt-1">
                            Your actions will appear here
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-black/5">
                        {activities.slice(0, 15).map((activity) => (
                            <div
                                key={activity.id}
                                className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/30 transition-colors"
                            >
                                <span className="text-base mt-0.5">{getActivityIcon(activity.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium leading-tight truncate">
                                        {activity.message}
                                    </p>
                                    <p className="text-[9px] text-black/40 font-mono uppercase mt-1">
                                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { CartesianGrid, AreaChart, XAxis, YAxis, Area } from 'recharts';

import {
    ChartContainer,
    type ChartConfig,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/Components/ui/chart';
import { ReportChartData } from '@/types';

export function LineChart({
    data,
    chartConfig,
}: {
    data: ReportChartData[];
    chartConfig: ChartConfig;
}) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[200px] w-full text-gray-500">
                No data available
            </div>
        );
    }

    const dataKeys = Object.keys(data[0]);

    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <AreaChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} stroke="#eee" />
                <YAxis type="number" tickLine={false} tickMargin={5} axisLine={false} />
                <XAxis
                    dataKey={dataKeys[0]}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                    <linearGradient id="worth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="15%" stopColor="var(--color-worth)" stopOpacity={0.75} />
                        <stop offset="85%" stopColor="var(--color-worth)" stopOpacity={0.15} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="worth"
                    stroke="var(--color-worth)"
                    fill="url(#worth)"
                />
                <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
        </ChartContainer>
    );
}

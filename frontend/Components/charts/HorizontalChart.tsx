import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
    ChartContainer,
    type ChartConfig,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/Components/ui/chart';

export function HorizontalChart({
    data,
    chartConfig,
}: {
    data: Array<any>;
    chartConfig: ChartConfig;
}) {
    console.log('data : ', data);

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
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} stroke="#ddd" />
                <YAxis type="number" tickLine={false} tickMargin={5} axisLine={false} />
                <XAxis
                    dataKey={dataKeys[0]}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />

                {dataKeys
                    .filter((key) => key !== dataKeys[0])
                    .map((key) => (
                        <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={1} />
                    ))}
            </BarChart>
        </ChartContainer>
    );
}

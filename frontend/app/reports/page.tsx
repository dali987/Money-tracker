'use client';

import { HorizontalChart } from '@/Components/charts/HorizontalChart';
import { LineChart } from '@/Components/charts/LineChart';
import Initializer from '@/Components/Initializer';
import SelectAccountDropdown from '@/Components/Custom/SelectAccountDropdown';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import MultiSelectDropdown from '@/Components/Custom/MultiSelectDropdown';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import SelectDropdown from '@/Components/Custom/SelectDropdown';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAccounts } from '@/hooks/useAccounts';

const periods = ['Yearly', 'Monthly'];

const chartConfig = {
    income: {
        label: 'Income',
        color: '#22c55e',
    },
    expense: {
        label: 'Expense',
        color: '#ef4444',
    },
    worth: {
        label: 'Worth',
        color: 'green',
    },
};

const PERIOD_CONFIGS: Record<string, any> = {
    monthly: {
        label: (date: Date) =>
            date.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
            }),
        add: (date: Date, val: number) => {
            const d = new Date(date);
            d.setMonth(d.getMonth() + val);
            return d;
        },
        range: (date: Date) => ({
            startDate: new Date(date.getFullYear(), date.getMonth(), 1),
            endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        }),
        groupBy: 'day',
        generateLabels: (date: Date) => {
            const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
        },
    },
    yearly: {
        label: (date: Date) => date.getFullYear().toString(),
        add: (date: Date, val: number) => {
            const d = new Date(date);
            d.setFullYear(d.getFullYear() + val);
            return d;
        },
        range: (date: Date) => ({
            startDate: new Date(date.getFullYear(), 0, 1),
            endDate: new Date(date.getFullYear(), 11, 31),
        }),
        groupBy: 'month',
        generateLabels: () =>
            Array.from({ length: 12 }, (_, i) =>
                new Date(0, i).toLocaleString('en-US', { month: 'long' })
            ),
    },
};

interface ChartEntry {
    period: string;
    income?: number;
    expense?: number;
    worth?: number;
}

const transformChartData = (rawData: any[], config: any, chartType: string, currentDate: Date) => {
    const isTagGrouping = chartType === 'expenseIncomeTags';
    const isSingleType = chartType === 'netIncome' || chartType === 'netExpense';
    const targetType = chartType === 'netIncome' ? 'income' : 'expense';

    if (isTagGrouping) {
        return rawData.map((item: any) => ({
            period: item._id,
            income: item.income,
            expense: item.expense,
        }));
    }

    const labels = config.generateLabels(currentDate);
    const dataMap = new Map(rawData.map((item: any) => [item._id.toString(), item]));

    return labels.map((label: string, index: number) => {
        const key = (index + 1).toString();
        const item: any = dataMap.get(key) || { income: 0, expense: 0 };
        const entry: ChartEntry = { period: label };

        if (isSingleType) {
            entry[targetType as 'income' | 'expense'] = item[targetType as keyof typeof item] || 0;
        } else {
            entry.income = item.income || 0;
            entry.expense = item.expense || 0;
        }
        return entry;
    });
};

const processNetWorthTrend = (response: any, config: any, currentDate: Date): ChartEntry[] => {
    const { netWorthAtEndOfPeriod, changes } = response;
    const labels = config.generateLabels(currentDate);
    let runningWorth = netWorthAtEndOfPeriod;

    return [...labels]
        .reverse()
        .map((label: string, reverseIndex: number) => {
            const index = labels.length - 1 - reverseIndex;
            const key = (index + 1).toString();
            const entry = { period: label, worth: runningWorth };
            const change = changes[key] || 0;
            runningWorth -= change;
            return entry;
        })
        .reverse();
};

const Page = () => {
    const { getTransactionsChart, getNetWorthChart } = useTransactionStore();
    const { authUser } = useAuthStore();

    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [excludeTags, setExcludeTags] = useState<string[]>([]);
    const [periodType, setPeriodType] = useState<'yearly' | 'monthly'>('monthly');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [chartType, setChartType] = useState<string>('expenseIncome');
    const [chartData, setChartData] = useState<ChartEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: accountsRaw = [], isLoading: isAccountsLoading } = useAccounts();

    const accounts = accountsRaw || [];

    const handleOptions = (accounts: Array<any>) => {
        if (!accounts) return [];
        const newAccounts = accounts.map((account) => ({
            name: account.name,
            type: account.type,
            id: account._id,
        }));
        return [{ name: 'All Accounts', type: '', id: '' }, ...newAccounts];
    };

    const handlePeriodTypeChange = (type: 'yearly' | 'monthly') => {
        setPeriodType(type);
        setCurrentDate(new Date());
    };

    const handleChange = (type: 'previous' | 'next') => {
        const val = type === 'previous' ? -1 : 1;
        setCurrentDate(PERIOD_CONFIGS[periodType].add(currentDate, val));
    };

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            const config = PERIOD_CONFIGS[periodType];
            const { startDate, endDate } = config.range(currentDate);

            if (chartType === 'netWorth') {
                const response = await getNetWorthChart({
                    startDate,
                    endDate,
                    groupBy: config.groupBy,
                    account: selectedAccount || undefined,
                    excludeTags: excludeTags.length > 0 ? excludeTags.join(',') : undefined,
                });
                if (response) {
                    setChartData(processNetWorthTrend(response, config, currentDate));
                }
            } else {
                const params: any = {
                    startDate,
                    endDate,
                    groupBy: chartType === 'expenseIncomeTags' ? 'tag' : config.groupBy,
                    user: !selectedAccount ? true : false,
                    excludeTags: excludeTags.length > 0 ? excludeTags.join(',') : undefined,
                };

                if (chartType === 'netIncome') params.type = 'income';
                if (chartType === 'netExpense') params.type = 'expense';
                if (chartType === 'expenseIncome' || chartType === 'expenseIncomeTags')
                    params.type = 'expense,income';

                if (selectedAccount) params.account = selectedAccount;

                const rawData = await getTransactionsChart(params);
                setChartData(transformChartData(rawData, config, chartType, currentDate));
            }
            setLoading(false);
        };

        fetchChartData();
    }, [
        periodType,
        currentDate,
        chartType,
        getTransactionsChart,
        getNetWorthChart,
        selectedAccount,
        excludeTags,
    ]);

    const renderChart = () => {
        const isSingleType = chartType === 'netIncome' || chartType === 'netExpense';
        const isWorth = chartType === 'netWorth';
        const targetType = chartType === 'netIncome' ? 'income' : 'expense';

        let currentConfig: any = chartConfig;

        if (isWorth) {
            currentConfig = { worth: chartConfig.worth };
        } else if (isSingleType) {
            currentConfig = { [targetType]: (chartConfig as any)[targetType] };
        }

        if (loading) {
            return (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={chartType}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full">
                {isWorth ? (
                    <LineChart data={chartData} chartConfig={currentConfig} />
                ) : (
                    <HorizontalChart data={chartData} chartConfig={currentConfig} />
                )}
            </motion.div>
        );
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.45,
                ease: 'easeOut',
                staggerChildren: 0.3,
                delayChildren: 0.4,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <main className="bg-white lg:bg-gray-200 flex justify-center items-start lg:items-center min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-3 lg:p-16">
            <Initializer rates />
            <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full lg:bg-white lg:rounded-lg lg:shadow-2xl lg:max-w-5xl lg:p-4 lg:px-6 flex flex-col gap-4">
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap justify-center lg:justify-between p-4 w-full gap-4">
                    <SelectDropdown
                        id="chartType"
                        defaultValue={chartType}
                        onSelect={(val) => setChartType(val)}
                        options={[
                            { label: 'Expense & Income', value: 'expenseIncome' },
                            { label: 'Expense & Income by Tags', value: 'expenseIncomeTags' },
                            { label: 'Net Income', value: 'netIncome' },
                            { label: 'Net Expense', value: 'netExpense' },
                            { label: 'Net Worth', value: 'netWorth' },
                        ]}
                    />
                    <div className="join">
                        <button className="join-item btn" onClick={() => handleChange('previous')}>
                            «
                        </button>
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn join-item">
                                {PERIOD_CONFIGS[periodType].label(currentDate)}
                            </div>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow">
                                {periods.map((period: string, i: number) => (
                                    <li key={i}>
                                        <a
                                            onClick={() => {
                                                (document.activeElement as HTMLElement)?.blur();
                                                handlePeriodTypeChange(
                                                    period.toLowerCase() as 'yearly' | 'monthly'
                                                );
                                            }}
                                            className="flex items-center">
                                            <span className="w-4">
                                                {periodType === period.toLowerCase() && (
                                                    <Check size={16} />
                                                )}
                                            </span>
                                            <span>{period}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button className="join-item btn" onClick={() => handleChange('next')}>
                            »
                        </button>
                    </div>
                </motion.div>
                <motion.div
                    variants={itemVariants}
                    className="min-h-64 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">{renderChart()}</AnimatePresence>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:gap-4">
                    <SelectAccountDropdown
                        name="account"
                        className="w-full"
                        options={handleOptions(accounts)}
                        placeholder="Select Account"
                        onSelect={(option: any) => setSelectedAccount(option.id)}
                    />
                    <MultiSelectDropdown
                        formFieldName="excludeTags"
                        className="w-full"
                        options={
                            authUser?.tags?.map((tag: string) => ({
                                label: tag,
                                value: tag,
                            })) || []
                        }
                        prompt="Exclude Tags"
                        onSelect={(selected: string[]) => setExcludeTags(selected)}
                    />
                </motion.div>
            </motion.section>
        </main>
    );
};

export default Page;

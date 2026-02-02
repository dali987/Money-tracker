import {
    Wallet,
    BarChart3,
    Shield,
    Zap,
    Target,
    CheckCircle2,
    DollarSign,
    PieChart,
    TrendingUp,
    Globe,
    Plus,
    ArrowLeftRight,
} from 'lucide-react';

export const colors = {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    secondary: '#10b981',
    secondaryDark: '#059669',
    secondaryLight: '#34d399',
    accent: '#f59e0b',
    accentDark: '#d97706',
    accentLight: '#fbbf24',
    success: '#22c55e',
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
    gradientStart: '#6366f1',
    gradientMid: '#8b5cf6',
    gradientEnd: '#ec4899',
    text: '#1f2937',
    textLight: '#6b7280',
    bg: '#ffffff',
    bgSecondary: '#f9fafb',
    bgTertiary: '#f3f4f6',
};

export const features = [
    {
        icon: Wallet,
        title: 'Multiple Accounts',
        description:
            'Create and manage multiple accounts (Cash, Bank, Credit) to organize your finances efficiently.',
        color: colors.primary,
        bgColor: `${colors.primary}15`,
    },
    {
        icon: TrendingUp,
        title: 'Track Transactions',
        description:
            'Record expenses, income, and transfers with customizable tags and categories for complete financial visibility.',
        color: colors.secondary,
        bgColor: `${colors.secondary}15`,
    },
    {
        icon: BarChart3,
        title: 'Smart Analytics',
        description:
            'Get detailed insights and analytics about your spending patterns with interactive charts and reports.',
        color: colors.info,
        bgColor: `${colors.info}15`,
    },
    {
        icon: Globe,
        title: 'Multi-Currency',
        description:
            'Track finances across multiple currencies with real-time exchange rates and automatic conversions.',
        color: colors.accent,
        bgColor: `${colors.accent}15`,
    },
    {
        icon: PieChart,
        title: 'Budget Planning',
        description:
            'Set budgets and track your progress towards financial goals with visual progress indicators.',
        color: colors.success,
        bgColor: `${colors.success}15`,
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description:
            'Your financial data is encrypted and stored securely. Your privacy is our priority.',
        color: colors.warning,
        bgColor: `${colors.warning}15`,
    },
];

export const stats = [
    { icon: DollarSign, value: '100', label: 'Free to Use', color: colors.primary, target: 100 },
    { icon: Zap, value: 'Real-time', label: 'Updates', color: colors.secondary },
    { icon: Target, value: 'Easy', label: 'Goal Setting', color: colors.accent },
    { icon: CheckCircle2, value: 'Secure', label: 'Data Protection', color: colors.info },
];

export const steps = [
    {
        number: '01',
        title: 'Create Accounts',
        description:
            'Set up your accounts in seconds - Cash, Bank, Credit, or custom types. Organize everything your way.',
        icon: Plus,
        color: colors.primary,
    },
    {
        number: '02',
        title: 'Add Transactions',
        description:
            'Record expenses, income, and transfers with just a few clicks. Categorize with custom tags.',
        icon: ArrowLeftRight,
        color: colors.secondary,
    },
    {
        number: '03',
        title: 'Analyze & Grow',
        description:
            'View insights, track trends, and make informed financial decisions with beautiful charts.',
        icon: TrendingUp,
        color: colors.accent,
    },
];
'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useEffect } from 'react';

const Initializer = ({ rates, currencies }: { rates?: boolean; currencies?: boolean }) => {
    const { getRates, getCurrencies } = useTransactionStore();
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
        if (rates) getRates();
        if (currencies) getCurrencies();
    }, [checkAuth, getRates, getCurrencies, rates, currencies]);

    return null;
};

export default Initializer;

'use client';

import { useTransactionStore } from '@/store/useTransactionStore';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const Initializer = ({ rates, currencies }: { rates?: boolean; currencies?: boolean }) => {
    const { getRates, getCurrencies } = useTransactionStore();
    const authUser = useAuthStore((state) => state.authUser);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

    useEffect(() => {
        if (isCheckingAuth || !authUser) return;
        if (rates) getRates();
        if (currencies) getCurrencies();
    }, [authUser, isCheckingAuth, getRates, getCurrencies, rates, currencies]);

    return null;
};

export default Initializer;

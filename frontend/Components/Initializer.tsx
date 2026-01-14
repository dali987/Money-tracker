'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useEffect } from 'react';

const Initializer = ({ rates, currencies }: { rates?: boolean; currencies?: boolean }) => {
    const { getRates, getCurrencies } = useTransactionStore();
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        // Fetch all initial data from one place
        checkAuth();
        rates && getRates();
        currencies && getCurrencies();
    }, [checkAuth, getRates, getCurrencies]); // Add dependencies

    return null; // This component doesn't render anything
};

export default Initializer;

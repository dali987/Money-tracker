'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionAuth';
import { useEffect } from 'react';

const Initializer = ({ rates, accounts, transactions } : {rates?: boolean, accounts?: boolean, transactions?: boolean}) => {
    const { getRates, getAccounts, getTransactions } = useTransactionStore();
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        // Fetch all initial data from one place
        rates && getRates()
        accounts && getAccounts();
        transactions && getTransactions();
    }, [checkAuth, getRates, getAccounts, getTransactions]); // Add dependencies

    return null; // This component doesn't render anything
};

export default Initializer;

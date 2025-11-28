// utils/currency.ts

export interface CurrencyFormatOptions {
    currency?: string;
    notation?: 'standard' | 'compact';
    compactThreshold?: number;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

export const formatCurrency = (
    amount: number,
    options: CurrencyFormatOptions = {}
): string => {
    const {
        currency = 'PKR',
        notation = 'standard',
        compactThreshold = 100000, // 100K threshold for compact notation
        locale = 'en-PK',
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
    } = options;

    // Handle null/undefined/zero amounts
    if (!amount || amount === 0) {
        return formatWithCurrency(0, currency, locale);
    }

    // Use compact notation for large numbers if specified
    if (notation === 'compact' && Math.abs(amount) >= compactThreshold) {
        return formatCompactCurrency(amount, currency, locale, maximumFractionDigits);
    }

    // Standard notation
    return formatWithCurrency(amount, currency, locale, minimumFractionDigits, maximumFractionDigits);
};

// Format with currency symbol/prefix
const formatWithCurrency = (
    amount: number,
    currency: string,
    locale: string,
    minimumFractionDigits: number = 0,
    maximumFractionDigits: number = 0
): string => {
    const formattedAmount = new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);

    return addCurrencyPrefix(formattedAmount, currency);
};

// Format compact currency with suffixes (K, L, Cr)
const formatCompactCurrency = (
    amount: number,
    currency: string,
    locale: string,
    maximumFractionDigits: number = 1
): string => {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    let value: number;
    let suffix: string;

    // Determine suffix based on amount
    if (absAmount >= 10000000) { // 1 Crore = 10,000,000
        value = absAmount / 10000000;
        suffix = 'Cr';
    } else if (absAmount >= 100000) { // 1 Lakh = 100,000
        value = absAmount / 100000;
        suffix = 'L';
    } else { // Thousands
        value = absAmount / 1000;
        suffix = 'K';
    }

    // Format the number with appropriate decimal places
    const formattedValue = value.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: value < 100 ? 1 : maximumFractionDigits,
    });

    return `${sign}${addCurrencyPrefix(formattedValue, currency)}${suffix}`;
};

// Add currency prefix based on currency code
const addCurrencyPrefix = (amount: string, currency: string): string => {
    const currencySymbols: { [key: string]: string } = {
        PKR: 'Rs ',
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        AED: 'AED ',
        SAR: 'SAR ',
    };

    const symbol = currencySymbols[currency] || `${currency} `;
    return `${symbol}${amount}`;
};

// Alternative function with more explicit control
export const formatAmount = (
    amount: number,
    options: {
        withSuffix?: boolean;
        currency?: string;
        compactThreshold?: number;
        locale?: string;
    } = {}
): string => {
    const {
        withSuffix = false,
        currency = 'PKR',
        compactThreshold = 100000,
        locale = 'en-PK',
    } = options;

    return formatCurrency(amount, {
        currency,
        notation: withSuffix ? 'compact' : 'standard',
        compactThreshold,
        locale,
    });
};

// Utility to parse currency string back to number
export const parseCurrency = (currencyString: string): number => {
    if (!currencyString) return 0;

    // Remove currency symbols and suffixes
    const cleaned = currencyString
        .replace(/Rs\s*|\$|€|£|₹|AED\s*|SAR\s*/g, '') // Remove currency symbols
        .replace(/[Kk]/, '000') // Handle K suffix
        .replace(/[Ll]/, '00000') // Handle L suffix
        .replace(/[Cc]r/, '0000000') // Handle Cr suffix
        .replace(/,/g, '') // Remove commas
        .trim();

    return parseFloat(cleaned) || 0;
};

// Get currency symbol only
export const getCurrencySymbol = (currency: string = 'PKR'): string => {
    const symbols: { [key: string]: string } = {
        PKR: 'Rs',
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        AED: 'AED',
        SAR: 'SAR',
    };

    return symbols[currency] || currency;
};
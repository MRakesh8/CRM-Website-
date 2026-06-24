import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "USD" | "EUR" | "GBP" | "JPY" | "INR" | "CAD" | "AUD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: Record<string, number>;
  formatCurrency: (amountUSD: number) => string;
  convertToUSD: (localAmount: number) => number;
  convertFromUSD: (amountUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const API_URL = "https://api.frankfurter.app/latest?from=USD";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("crm_currency");
    return (saved as Currency) || "USD";
  });
  
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setRates({ USD: 1, ...data.rates });
        }
      })
      .catch((err) => console.error("Failed to fetch exchange rates", err));
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("crm_currency", newCurrency);
  };

  const formatCurrency = (amountUSD: number) => {
    const rate = rates[currency] || 1;
    const converted = amountUSD * rate;
    
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(converted);
  };

  const convertToUSD = (localAmount: number) => {
    const rate = rates[currency] || 1;
    return localAmount / rate;
  };

  const convertFromUSD = (amountUSD: number) => {
    const rate = rates[currency] || 1;
    return amountUSD * rate;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatCurrency, convertToUSD, convertFromUSD }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}


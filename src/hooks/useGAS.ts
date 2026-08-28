import { useState, useEffect, useCallback } from 'react';
import { Portfolio, Menu } from '../types';

declare global {
  interface Window {
    google?: {
      script: {
        run: {
          withSuccessHandler: (callback: (data: any) => void) => any;
          withFailureHandler: (callback: (err: any) => void) => any;
        };
      };
    };
  }
}

export function useGAS() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [settings, setSettings] = useState<{landingTitle?: string, landingDescription?: string}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  const fetchPortfolios = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.google && window.google.script && window.google.script.run) {
        // Fetch via Google Apps Script native API (when hosted inside GAS)
        window.google.script.run
          .withSuccessHandler((dataStr: string) => {
            const data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
            setPortfolios(Array.isArray(data) ? data : []);
          })
          .withFailureHandler((err: any) => {
            console.error('GAS Error fetching portfolios:', err);
            setError(err.toString());
          })
          .getPortfolios();
      } else {
        // Fetch via Express Proxy (AI Studio environment)
        const response = await fetch('/api/portfolios');
        if (!response.ok) throw new Error('Failed to fetch portfolios');
        const data = await response.json();
        setPortfolios(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error('Error fetching portfolios:', err);
      setError(err.message || 'Failed to fetch portfolios');
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.google && window.google.script && window.google.script.run) {
        window.google.script.run
          .withSuccessHandler((dataStr: string) => {
            const data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
            setMenus(Array.isArray(data) ? data : []);
          })
          .withFailureHandler((err: any) => {
            console.error('GAS Error fetching menus:', err);
            setError(err.toString());
          })
          .getMenus();
      } else {
        const response = await fetch('/api/menus');
        if (!response.ok) throw new Error('Failed to fetch menus');
        const data = await response.json();
        setMenus(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error('Error fetching menus:', err);
      setError(err.message || 'Failed to fetch menus');
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchPortfolios(), fetchMenus(), fetchSettings()]);
    setLoading(false);
  }, [fetchPortfolios, fetchMenus, fetchSettings]);

  const savePortfolio = async (title: string, category: string, description: string, imageBase64: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google && window.google.script && window.google.script.run) {
        window.google.script.run
          .withSuccessHandler((responseStr: string) => {
            const response = typeof responseStr === 'string' ? JSON.parse(responseStr) : responseStr;
            if (response.success) {
              fetchPortfolios(); // refresh data
              resolve(response);
            } else {
              reject(new Error(response.message || 'Failed to save'));
            }
          })
          .withFailureHandler((err: any) => {
            reject(new Error(err.toString()));
          })
          .savePortfolio(title, category, description, imageBase64);
      } else {
        fetch('/api/portfolios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, description, imageBase64 })
        })
          .then(async res => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save via API');
            return data;
          })
          .then(data => {
            fetchPortfolios(); // refresh data
            resolve({ success: true, data });
          })
          .catch(err => reject(err));
      }
    });
  };

  const saveMenusData = async (newMenus: Menu[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google && window.google.script && window.google.script.run) {
        window.google.script.run
          .withSuccessHandler((responseStr: string) => {
             const response = typeof responseStr === 'string' ? JSON.parse(responseStr) : responseStr;
             if (response.success) {
               fetchMenus(); // refresh data
               resolve(response);
             } else {
               reject(new Error(response.message || 'Failed to save menus'));
             }
          })
          .withFailureHandler((err: any) => {
             reject(new Error(err.toString()));
          })
          .saveMenus(newMenus);
      } else {
        fetch('/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMenus)
        })
          .then(async res => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save menus via API');
            return data;
          })
          .then(data => {
            fetchMenus(); // refresh data
            resolve({ success: true, data });
          })
          .catch(err => reject(err));
      }
    });
  };

  return {
    portfolios,
    menus,
    settings,
    loading,
    error,
    fetchAll,
    fetchPortfolios,
    fetchMenus,
    fetchSettings,
    savePortfolio,
    saveMenus: saveMenusData,
    setMenus
  };
}

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
  const [categories, setCategories] = useState<string[]>([]);
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

  
  const fetchCategories = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.google && window.google.script && window.google.script.run) {
        window.google.script.run
          .withSuccessHandler((dataStr: string) => {
            const data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
            setCategories(Array.isArray(data) ? data : []);
          })
          .withFailureHandler((err: any) => {
            console.error('GAS Error fetching categories:', err);
            setError(err.toString());
          })
          .getCategories();
      } else {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchPortfolios(), fetchMenus(), fetchSettings(), fetchCategories()]);
    setLoading(false);
  }, [fetchPortfolios, fetchMenus, fetchSettings, fetchCategories]);

  
  const saveCategories = async (newCategories: string[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google && window.google.script && window.google.script.run) {
        window.google.script.run
          .withSuccessHandler((responseStr: string) => {
             const response = typeof responseStr === 'string' ? JSON.parse(responseStr) : responseStr;
             if (response.success) {
               fetchCategories();
               resolve(response);
             } else {
               reject(new Error(response.message || 'Failed to save categories'));
             }
          })
          .withFailureHandler((err: any) => reject(new Error(err.toString())))
          .saveCategories(newCategories);
      } else {
        fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'saveCategories', categories: newCategories })
        })
          .then(async res => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save categories');
            return data;
          })
          .then(data => { fetchCategories(); resolve({ success: true, data }); })
          .catch(err => reject(err));
      }
    });
  };

  const deletePortfolio = async (id: string | number): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google && window.google.script && window.google.script.run) {
        window.google.script.run
          .withSuccessHandler((responseStr: string) => {
            const response = typeof responseStr === 'string' ? JSON.parse(responseStr) : responseStr;
            if (response.success) { fetchPortfolios(); resolve(response); } else reject(new Error(response.message));
          })
          .withFailureHandler((err: any) => reject(new Error(err.toString())))
          .deletePortfolio(id);
      } else {
        fetch('/api/portfolios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deletePortfolio', id })
        })
          .then(async res => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to delete portfolio');
            return data;
          })
          .then(data => { fetchPortfolios(); resolve({ success: true, data }); })
          .catch(err => reject(err));
      }
    });
  };

  const savePortfolio = async (id: string | number | null, title: string, category: string, description: string, imageBase64: string): Promise<any> => {
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
          .savePortfolio(id, title, category, description, imageBase64);
      } else {
        fetch('/api/portfolios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'savePortfolio', id, title, category, description, imageBase64 })
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
          body: JSON.stringify({ action: 'saveMenus', menus: newMenus })
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
    categories,
    fetchCategories,
    saveCategories,
    deletePortfolio,
    setMenus
  };
}

const fs = require('fs');
let code = fs.readFileSync('src/hooks/useGAS.ts', 'utf8');

// Add categories state
code = code.replace("const [menus, setMenus] = useState<Menu[]>([]);",
"const [menus, setMenus] = useState<Menu[]>([]);\n  const [categories, setCategories] = useState<string[]>([]);");

// Add fetchCategories
const fetchCategoriesStr = `
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
`;
code = code.replace("const fetchAll = useCallback(async () => {", fetchCategoriesStr + "\n  const fetchAll = useCallback(async () => {");

// Update fetchAll
code = code.replace("await Promise.all([fetchPortfolios(), fetchMenus(), fetchSettings()]);",
"await Promise.all([fetchPortfolios(), fetchMenus(), fetchSettings(), fetchCategories()]);");
code = code.replace("[fetchPortfolios, fetchMenus, fetchSettings]", "[fetchPortfolios, fetchMenus, fetchSettings, fetchCategories]");

// Add saveCategories and deletePortfolio, update savePortfolio
code = code.replace("const savePortfolio = async (title: string, category: string, description: string, imageBase64: string): Promise<any> => {",
`
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

  const savePortfolio = async (id: string | number | null, title: string, category: string, description: string, imageBase64: string): Promise<any> => {`);

// Also update the body payload for savePortfolio
code = code.replace("body: JSON.stringify({ action: 'savePortfolio', title, category, description, imageBase64 })",
"body: JSON.stringify({ action: 'savePortfolio', id, title, category, description, imageBase64 })");

// GAS call for savePortfolio
code = code.replace(".savePortfolio(title, category, description, imageBase64);",
".savePortfolio(id, title, category, description, imageBase64);");

// Update return statement
code = code.replace("saveMenus: saveMenusData,",
"saveMenus: saveMenusData,\n    categories,\n    fetchCategories,\n    saveCategories,\n    deletePortfolio,");


fs.writeFileSync('src/hooks/useGAS.ts', code);

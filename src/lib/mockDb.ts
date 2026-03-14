// Mock Data
export const DB = {
    users: [
        { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 28, country: "USA" },
        { id: 2, name: "Bob Smith", email: "bob@example.com", age: 34, country: "UK" },
        { id: 3, name: "Charlie Brown", email: "charlie@example.com", age: 22, country: "Canada" },
        { id: 4, name: "Diana Prince", email: "diana@example.com", age: 30, country: "USA" },
    ],
    products: [
        { id: 101, name: "Laptop", price: 999.99, category: "Electronics", stock: 50 },
        { id: 102, name: "Smartphone", price: 699.99, category: "Electronics", stock: 120 },
        { id: 103, name: "Desk Chair", price: 150.00, category: "Furniture", stock: 30 },
    ],
    orders: [
        { id: 5001, user_id: 1, product_id: 101, amount: 999.99, date: "2023-10-01" },
        { id: 5002, user_id: 2, product_id: 103, amount: 150.00, date: "2023-10-02" },
    ]
};

// Basic SQL Runner (supports SELECT, WHERE, ORDER BY, LIMIT)
export function executeMockSQL(query: string): { data: any[]; error: string | null } {
    try {
        const q = query.toLowerCase();

        if (!q.startsWith('select')) {
            return { data: [], error: "Only SELECT statements are supported in this demo." };
        }

        // FROM
        const fromMatch = q.match(/from\s+(\w+)/i);
        if (!fromMatch) return { data: [], error: "Missing FROM clause" };

        const tableName = fromMatch[1];
        if (!DB[tableName as keyof typeof DB]) return { data: [], error: `Table '${tableName}' not found` };

        let data = [...DB[tableName as keyof typeof DB]];

        // WHERE
        const whereMatch = q.match(/where\s+(\w+)\s*=\s*['"]?([^'"\s]+)['"]?/i);
        if (whereMatch) {
            const col = whereMatch[1];
            let val: string | number = whereMatch[2];
            if (!isNaN(Number(val))) val = parseFloat(val);
            // @ts-ignore
            data = data.filter(row => row[col] == val);
        }

        // ORDER BY
        const orderMatch = q.match(/order by\s+(\w+)(\s+desc)?/i);
        if (orderMatch) {
            const col = orderMatch[1];
            const desc = !!orderMatch[2];
            data.sort((a: any, b: any) => {
                if (a[col] < b[col]) return desc ? 1 : -1;
                if (a[col] > b[col]) return desc ? -1 : 1;
                return 0;
            });
        }

        // LIMIT
        const limitMatch = q.match(/limit\s+(\d+)/i);
        if (limitMatch) {
            data = data.slice(0, parseInt(limitMatch[1]));
        }

        return { data, error: null };

    } catch (e: any) {
        return { data: [], error: e.message };
    }
}
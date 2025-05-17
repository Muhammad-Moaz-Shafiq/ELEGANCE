class DBHandler {
    static async readDB() {
        try {
            const response = await fetch('db.json');
            return await response.json();
        } catch (error) {
            console.error('Error reading database:', error);
            return { products: [], cart: [] };
        }
    }
    static async writeDB(data) {
        try {
            const response = await fetch('db.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error writing to database:', error);
        }
    }
    static async getCart() {
        const db = await this.readDB();
        return db.cart;
    }
    static async updateCart(cart) {
        const db = await this.readDB();
        db.cart = cart;
        await this.writeDB(db);
    }
}
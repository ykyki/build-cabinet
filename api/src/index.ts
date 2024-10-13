import { Hono } from 'hono';

type Bindings = {
    ENV_KIND: 'prod' | 'dev';
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
    return c.text('Hello World!');
});

app.get('/health', async (c) => {
    const envKind = (() => {
        switch (c.env.ENV_KIND) {
            case 'prod':
                return 'production';
            case 'dev':
                return 'development';
        }
    })();

    const stmt = c.env.DB.prepare('SELECT 1 as c1');
    const dbConnection = await stmt.first('c1');

    const now = new Date().toISOString();

    return c.json({
        envKind,
        dbConnection,
        now,
    });
});

export default app;

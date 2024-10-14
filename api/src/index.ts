import { format } from 'date-fns';
import { Hono } from 'hono';
import { createFactory } from 'hono/factory';

type Bindings = {
    ENV_KIND: 'prod' | 'dev';
    DB: D1Database;
};

type Logger = (str: string, ...rest: string[]) => void;

type Variables = {
    requestId: string;
    logger: Logger;
};

type Env = {
    Bindings: Bindings;
    Variables: Variables;
};

const factory = createFactory<Env>();

const setRequestId = factory.createMiddleware(async (c, next) => {
    const date = new Date();
    const formattedDate = format(date, 'yyyyMMddHHmmssSSS');
    c.set('requestId', formattedDate);
    await next();
});

const setLogger = factory.createMiddleware(async (c, next) => {
    const requestId = c.var.requestId;
    const logger: Logger = (str, ...rest) => {
        console.log(`${requestId}:`, str, ...rest);
    };
    c.set('logger', logger);
    await next();
});

const logEnds = factory.createMiddleware(async (c, next) => {
    c.var.logger('-->', c.req.path, c.req.method);
    const start = Date.now();
    await next();
    const end = Date.now();
    const ms = end - start;
    c.var.logger(
        '<--',
        c.req.path,
        c.req.method,
        c.res.status.toString(),
        `(${ms} ms)`,
    );
});

const app = new Hono<Env>();

app.use(setRequestId);
app.use(setLogger);
app.use(logEnds);

app.get('/', async (c) => {
    return c.text('Hello World!');
});

app.get('/health', async (c) => {
    c.var.logger('check health');
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

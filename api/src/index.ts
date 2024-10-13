import { Hono } from 'hono';

type Bindings = {
    ENV_KIND: 'prod' | 'stg' | 'local';
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
    const helloMessage = (() => {
        switch (c.env.ENV_KIND) {
            case 'prod':
                return 'production';
            case 'stg':
                return 'staging';
            case 'local':
                return 'local';
        }
    })();

    return c.text(`Hello World! (${helloMessage})`);
});

export default app;

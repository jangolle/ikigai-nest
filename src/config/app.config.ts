export type AppConfig = {
  worker: {
    tickMs: number;
  };
  swagger: {
    title: string;
    description: string;
    version: string;
  };
};

export default (): AppConfig => ({
  worker: {
    tickMs: 1000,
  },
  swagger: {
    title: 'ikigai:nest',
    description: 'API Docs',
    version: '0.1.0',
  },
});

import httpServer from "./app";
import logger from "./logger/winston.logger";

const port = process.env.PORT || 8000;

const startServer = () => {
    httpServer.listen(port, () => {
        logger.info(`Server is running on port ${port}`);
        logger.info(`Why not check the health of the server at http://localhost:${port}/api/health`);
    });
};

startServer();
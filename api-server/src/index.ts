import app from "./app";

const port = process.env.PORT || 8000;

const startServer = () => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();
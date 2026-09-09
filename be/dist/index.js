import express from 'express';
const app = express();
const PORT = 4000;
// Định nghĩa route sử dụng Request và Response chuẩn từ express
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

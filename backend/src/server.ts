import app from "./app";
const port = Number(process.env.PORT || 5001);

app.listen(port, () => {
  console.log(`Intelligent Logic Tutor backend running on http://localhost:${port}`);
});

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwbAiUJsQiJSu8SuAW99cH4I2Wo0As0ObegD4mcRLBIvRmh2d2BHqp9FP7JBakmaSRCcA/exec';
async function test() {
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'savePortfolio',
      title: 'Test Portfolio',
      category: 'Web & Otomasi',
      description: 'Test description',
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    })
  });
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response text:", text);
}
test();

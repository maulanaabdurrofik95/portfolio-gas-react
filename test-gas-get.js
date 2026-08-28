const GAS_URL = 'https://script.google.com/macros/s/AKfycbwbAiUJsQiJSu8SuAW99cH4I2Wo0As0ObegD4mcRLBIvRmh2d2BHqp9FP7JBakmaSRCcA/exec';
async function test() {
  const response = await fetch(GAS_URL + '?action=getMenus');
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response text:", text);
}
test();

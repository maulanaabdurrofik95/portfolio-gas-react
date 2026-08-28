const fs = require('fs');
let code = fs.readFileSync('gas-template/Code.gs', 'utf8');

// Add to doGet routing
code = code.replace("if (e.parameter.action === 'getMenus') {",
`if (e.parameter.action === 'getCategories') {
    return ContentService.createTextOutput(JSON.stringify(getCategories()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (e.parameter.action === 'getMenus') {`);

// Add to doPost routing
code = code.replace("if (action === 'savePortfolio') {",
`if (action === 'savePortfolio') {
      const result = savePortfolio(payload.id, payload.title, payload.category, payload.description, payload.imageBase64);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'deletePortfolio') {
      const result = deletePortfolio(payload.id);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'saveCategories') {
      const result = saveCategories(payload.categories);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }`);

// Replace savePortfolio definition to handle update
code = code.replace("function savePortfolio(title, category, description, imageBase64) {",
`function deletePortfolio(id) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Portfolio');
    if (!sheet) return { success: false, message: 'Sheet not found' };
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Portofolio dihapus' };
      }
    }
    return { success: false, message: 'ID not found' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function savePortfolio(id, title, category, description, imageBase64) {`);

code = code.replace(
`    // Upload image to Drive and get URL
    const imageUrl = uploadFileToDrive(imageBase64, title + '_image');
    
    // Append to sheet
    const newId = new Date().getTime();
    const createdAt = new Date().toISOString();
    
    sheet.appendRow([newId, title, category, description, imageUrl, createdAt]);
    
    return { success: true, message: 'Portofolio berhasil disimpan' };`,
`    let imageUrl = '';
    
    // If we have an ID, it's an update
    if (id) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          // Keep existing image URL if no new base64 is provided
          imageUrl = data[i][4];
          if (imageBase64 && imageBase64.startsWith('data:image')) {
            imageUrl = uploadFileToDrive(imageBase64, title + '_image');
          }
          sheet.getRange(i + 1, 2, 1, 4).setValues([[title, category, description, imageUrl]]);
          return { success: true, message: 'Portofolio berhasil diperbarui' };
        }
      }
      return { success: false, message: 'Portofolio tidak ditemukan' };
    } else {
      // New portfolio
      if (imageBase64 && imageBase64.startsWith('data:image')) {
        imageUrl = uploadFileToDrive(imageBase64, title + '_image');
      }
      const newId = new Date().getTime();
      const createdAt = new Date().toISOString();
      
      sheet.appendRow([newId, title, category, description, imageUrl, createdAt]);
      return { success: true, message: 'Portofolio berhasil disimpan' };
    }`);

// Append getCategories and saveCategories
code += `

/**
 * Get Categories
 */
function getCategories() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Categories');
    if (!sheet) return ['Web & Otomasi', 'Algorithmic Trading', 'IoT & Hardware']; // Default
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const categories = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) categories.push(data[i][0]);
    }
    return categories;
  } catch (error) {
    Logger.log('Error getting categories: ' + error.toString());
    return [];
  }
}

/**
 * Save Categories
 */
function saveCategories(categories) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Categories');
    if (!sheet) {
      sheet = ss.insertSheet('Categories');
      sheet.appendRow(['Name']);
    }
    
    // clear content
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 1).clearContent();
    }
    
    if (categories && categories.length > 0) {
      const rows = categories.map(c => [c]);
      sheet.getRange(2, 1, rows.length, 1).setValues(rows);
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}
`;

fs.writeFileSync('gas-template/Code.gs', code);

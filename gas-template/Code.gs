/**
 * Google Apps Script Backend
 * Deploy as Web App
 */

function doGet(e) {
  // --- API ROUTING FOR REACT BACKEND ---
  if (e.parameter.action === 'getPortfolios') {
    return ContentService.createTextOutput(JSON.stringify(getPortfolios()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (e.parameter.action === 'getCategories') {
    return ContentService.createTextOutput(JSON.stringify(getCategories()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (e.parameter.action === 'getMenus') {
    return ContentService.createTextOutput(JSON.stringify(getMenus()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // --- HTML RENDERING (Optional, for GAS frontend) ---
  if (e.parameter.page === 'admin') {
    return HtmlService.createTemplateFromFile('Admin')
      .evaluate()
      .setTitle('Admin Panel - Portfolio')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Maulana Abdur Rofik - Portfolio')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Handle POST Requests from React Backend
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    
    if (action === 'savePortfolio') {
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
    }
      const result = savePortfolio(payload.title, payload.category, payload.description, payload.imageBase64);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'saveMenus') {
      const result = saveMenus(payload.menus);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, message: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Upload Base64 image to Google Drive and get the public URL.
 * Make sure the folder is shared as "Anyone with the link can view".
 */

/**
 * SETUP FUNCTION - JALANKAN INI PERTAMA KALI
 * Pilih fungsi 'setup' di menu atas editor Apps Script, lalu klik 'Run' (Jalankan)
 * Ini akan memunculkan popup untuk meminta otorisasi (izin) ke Google Drive Anda.
 */
function setup() {
  DriveApp.getRootFolder();
  SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("Setup berhasil! Izin akses telah diberikan.");
}

function uploadFileToDrive(base64Data, filename) {
  try {
    // GANTI ID DI BAWAH INI DENGAN ID FOLDER GOOGLE DRIVE ANDA!
    const folderId = 'ISI_DENGAN_ID_FOLDER_DRIVE_ANDA_DI_SINI';
    const folder = DriveApp.getFolderById(folderId);
    
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    
    const blob = Utilities.newBlob(byteCharacters, type, filename || 'portfolio_img_' + new Date().getTime());
    const file = folder.createFile(blob);
    
    // Return direct download/view link
    return 'https://drive.google.com/uc?export=view&id=' + file.getId();
  } catch (error) {
    Logger.log('Error in uploadFileToDrive: ' + error.toString());
    throw new Error('Gagal mengupload gambar ke Drive: ' + error.toString());
  }
}

/**
 * Save new portfolio entry to Spreadsheet
 */
function deletePortfolio(id) {
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

function savePortfolio(id, title, category, description, imageBase64) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Portfolio');
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Portfolio');
      sheet.appendRow(['ID', 'Title', 'Category', 'Description', 'ImageUrl', 'CreatedAt']);
    }
    
    let imageUrl = '';
    
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
    }
  } catch (error) {
    Logger.log('Error in savePortfolio: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Get all portfolios from Spreadsheet
 */
function getPortfolios() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Portfolio');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Empty or only headers
    
    const portfolios = [];
    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
      portfolios.push({
        id: data[i][0],
        title: data[i][1],
        category: data[i][2],
        description: data[i][3],
        imageUrl: data[i][4],
        createdAt: data[i][5]
      });
    }
    
    // Return sorted by newest first
    return portfolios.reverse();
  } catch (error) {
    Logger.log('Error in getPortfolios: ' + error.toString());
    return [];
  }
}

/**
 * Save menus to Spreadsheet
 */
function saveMenus(menus) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Menus');
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Menus');
      sheet.appendRow(['ID', 'Label', 'Link', 'Type', 'Content']);
    }
    
    // Check if headers have 5 columns, if not, update them
    const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 5)).getValues()[0];
    if (headers.length < 5 || headers[3] !== 'Type') {
      sheet.getRange(1, 1, 1, 5).setValues([['ID', 'Label', 'Link', 'Type', 'Content']]);
    }

    // Clear existing data (except header)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
    
    // Insert new menus
    if (menus && menus.length > 0) {
      const rows = menus.map(m => [m.id, m.label, m.link, m.type || 'portfolio', m.content || '']);
      sheet.getRange(2, 1, rows.length, 5).setValues(rows);
    }
    
    return { success: true };
  } catch (error) {
    Logger.log('Error in saveMenus: ' + error.toString());
    return { success: false };
  }
}

/**
 * Get all menus from Spreadsheet
 */
function getMenus() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Menus');
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Empty or only headers
    
    const menus = [];
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      menus.push({
        id: data[i][0],
        label: data[i][1],
        link: data[i][2],
        type: data[i][3] || 'portfolio',
        content: data[i][4] || ''
      });
    }
    
    return menus;
  } catch (error) {
    Logger.log('Error in getMenus: ' + error.toString());
    return [];
  }
}


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

// ============================================================
// THE PASSION COMPANY — Waitlist Form Handler
// Google Apps Script (deploy as Web App)
//
// SETUP:
// 1. Open your Google Sheet:
//    https://docs.google.com/spreadsheets/d/1w8y196NuFsesnizyr40hXP_iGw1GinclelbMk7ZfA4c
// 2. Go to Extensions > Apps Script
// 3. Delete any existing code in Code.gs
// 4. Paste this entire script into Code.gs
// 5. Click Deploy > New deployment
// 6. Select type: "Web app"
// 7. Set "Execute as": Me (your Google account)
// 8. Set "Who has access": Anyone
// 9. Click Deploy and authorize when prompted
// 10. Copy the Web App URL — it looks like:
//     https://script.google.com/macros/s/AKfycb.../exec
// 11. Paste that URL into main.js where it says APPS_SCRIPT_URL
// ============================================================

// Configuration
var SHEET_NAME = "Subscribers";
var NOTIFY_EMAILS = ["jeremy@thepassioncompany.org", "amber@thepassioncompany.org"];
var EMAIL_SUBJECT = "New Passion Utility Subscriber";

// Handle POST requests from the form
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name = data.name || "";
    var email = data.email || "";
    
    if (!email) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Email required" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Write to spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" });
    sheet.appendRow([name, email, timestamp, "passionutility.com"]);
    
    // Send notification email
    var emailBody = "New subscriber from passionutility.com:\n\n" +
                    "Name: " + name + "\n" +
                    "Email: " + email + "\n" +
                    "Date: " + timestamp + "\n";
    
    NOTIFY_EMAILS.forEach(function(recipient) {
      MailApp.sendEmail(recipient, EMAIL_SUBJECT, emailBody);
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "TPC Waitlist endpoint active" }))
    .setMimeType(ContentService.MimeType.JSON);
}

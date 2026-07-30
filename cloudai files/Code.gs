/**
 * Wine Cellar – pop-up data-entry form, automatic time-stamp, and setup helpers
 * Apps Script bound to the Google Sheet (Extensions ▸ Apps Script)
 *
 * Column layout on the Cellar sheet (A → AC):
 *   A Photo (live =IMAGE formula, reads column B)   B Label Photo (URL)   C ID
 *   D Producer   E Wine Name   F Vintage   G Type   H Grape(s)   I Region
 *   J Country   K Alcohol %   L Bottle Size   M Quantity   N Purchase Date
 *   O Purchase Price   P Drinking Window Start   Q Drinking Window End
 *   R Status   S Personal Rating   T Reviews & Notes (wide, wraps)
 *   U Last Updated   V Drink Status (auto formula)
 *   W Halliday   X Hook   Y RP   Z Larkin   AA My Score   AB Others
 *   AC Storage Location
 *
 * Menu: 🍷 Cellar
 *   • Add Bottle…          – pop-up form, writes to the next empty row,
 *                            auto-fills ID, Photo/Drink Status formulas,
 *                            and stamps Last Updated.
 *   • Re-stamp selected row – refreshes Last Updated on the active row.
 *   • Rebuild dropdowns     – (re)applies data validation to columns G,L,J,R,S.
 *   • Rebuild Filter Views  – creates the three native Data ▸ Filter views
 *                            (Ready to drink, Coming into window, Qty = 0).
 *                            Requires the "Sheets API" advanced service
 *                            (Services ▸ + ▸ Google Sheets API) — see Read Me.
 */

const SHEET_NAME = 'Cellar';
const HEADER_ROW = 1;
const LAST_ROW = 1500; // matches the formula fill-down range set up in the sheet

// Columns collected on the form, in a sensible entry order (skips Photo, ID,
// Last Updated and Drink Status — those are automatic).
const FORM_FIELDS = [
  { key: 'photoUrl',  label: 'Label Photo (URL)',     type: 'text'                    },
  { key: 'producer',  label: 'Producer',              type: 'text',   required: true  },
  { key: 'wineName',  label: 'Wine Name',             type: 'text',   required: true  },
  { key: 'vintage',   label: 'Vintage (year or NV)',  type: 'text'                    },
  { key: 'wtype',     label: 'Type',                  type: 'select', options: ['Red','White','Sparkling','Rosé','Fortified','Dessert','Other'] },
  { key: 'grapes',    label: 'Grape(s)',              type: 'text'                    },
  { key: 'region',    label: 'Region',                type: 'text'                    },
  { key: 'country',   label: 'Country',               type: 'select', options: ['Australia','France','Italy','Spain','USA','New Zealand','Portugal','Germany','Argentina','Chile','South Africa','Other'] },
  { key: 'abv',       label: 'Alcohol %',             type: 'number'                  },
  { key: 'size',      label: 'Bottle Size',           type: 'select', options: ['375ml','500ml','750ml','1000ml','1500ml','3000ml'] },
  { key: 'qty',       label: 'Quantity',              type: 'number', required: true  },
  { key: 'purchDate', label: 'Purchase Date',         type: 'date'                    },
  { key: 'price',     label: 'Purchase Price',        type: 'number'                  },
  { key: 'winStart',  label: 'Drinking Window Start (year)', type: 'number'           },
  { key: 'winEnd',    label: 'Drinking Window End (year)',   type: 'number'           },
  { key: 'status',    label: 'Status',                type: 'select', options: ['In Cellar','Reserved','Gifted','Drunk','Archived'] },
  { key: 'rating',    label: 'Personal Rating (1-5)', type: 'select', options: ['','1','2','3','4','5'] },
  { key: 'notes',     label: 'Reviews & Notes (paste critic review text here)', type: 'textarea' },
  { key: 'halliday',  label: 'Halliday Score',        type: 'number'                  },
  { key: 'hook',      label: 'Hook Score',             type: 'number'                  },
  { key: 'rp',        label: 'RP Score',               type: 'number'                  },
  { key: 'larkin',    label: 'Larkin Score',           type: 'number'                  },
  { key: 'myScore',   label: 'My Score',               type: 'number'                  },
  { key: 'others',    label: 'Others (score + source, free text)', type: 'text'        },
  { key: 'location',  label: 'Storage Location',      type: 'text'                    }
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🍷 Cellar')
    .addItem('Add Bottle…', 'showAddBottleForm')
    .addItem('Re-stamp selected row', 'restampActiveRow')
    .addSeparator()
    .addItem('Rebuild dropdowns', 'setupValidation')
    .addItem('Rebuild Filter Views', 'createFilterViews')
    .addToUi();
}

function showAddBottleForm() {
  const rows = FORM_FIELDS.map(function (f) {
    let input;
    if (f.type === 'select') {
      input = '<select name="' + f.key + '">' +
        f.options.map(function (o) { return '<option>' + o + '</option>'; }).join('') +
        '</select>';
    } else if (f.type === 'textarea') {
      input = '<textarea name="' + f.key + '" rows="3"></textarea>';
    } else {
      input = '<input name="' + f.key + '" type="' + f.type + '" ' +
        (f.type === 'number' ? 'step="any"' : '') + '>';
    }
    return '<label>' + f.label + (f.required ? ' *' : '') + input + '</label>';
  }).join('');

  const html =
    '<style>' +
      'body{font-family:Arial,Helvetica,sans-serif;margin:12px;color:#222}' +
      'label{display:block;font-size:12px;font-weight:600;margin:8px 0 2px}' +
      'input,select,textarea{width:100%;box-sizing:border-box;padding:6px;' +
        'border:1px solid #cbb;border-radius:4px;font-size:13px}' +
      '.bar{margin-top:14px;text-align:right}' +
      'button{background:#6B2130;color:#fff;border:0;padding:9px 18px;' +
        'border-radius:5px;font-size:13px;cursor:pointer}' +
      '#msg{color:#6B2130;font-size:12px;margin-top:8px}' +
    '</style>' +
    '<form id="f">' + rows +
      '<div class="bar"><span id="msg"></span> ' +
      '<button type="button" onclick="save()">Add to cellar</button></div>' +
    '</form>' +
    '<script>' +
      'function save(){' +
        'var d={};var els=document.forms[0].elements;' +
        'for(var i=0;i<els.length;i++){if(els[i].name)d[els[i].name]=els[i].value;}' +
        'if(!d.producer||!d.wineName){document.getElementById("msg").innerText="Producer and Wine Name are required.";return;}' +
        'document.getElementById("msg").innerText="Saving…";' +
        'google.script.run.withSuccessHandler(function(id){' +
          'document.getElementById("msg").innerText="Added as ID "+id+".";' +
          'document.forms[0].reset();' +
        '}).addBottle(d);' +
      '}' +
    '<\/script>';

  const ui = HtmlService.createHtmlOutput(html).setWidth(400).setHeight(680);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Add a bottle');
}

/** Writes one bottle to the next empty row; returns the new ID. */
function addBottle(d) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const lastRow = sh.getLastRow();
  const newRow = lastRow + 1;

  // Auto ID = max existing ID + 1 (ID lives in column C)
  let newId = 1;
  if (lastRow > HEADER_ROW) {
    const ids = sh.getRange(HEADER_ROW + 1, 3, lastRow - HEADER_ROW, 1).getValues();
    newId = Math.max.apply(null, ids.map(function (r) { return Number(r[0]) || 0; })) + 1;
  }

  // Columns B-U (2-21): URL, ID, Producer .. Notes, Last Updated
  const coreRow = [
    d.photoUrl, newId,
    d.producer, d.wineName, d.vintage, d.wtype, d.grapes, d.region, d.country,
    d.abv ? Number(d.abv) : '', d.size,
    d.qty ? Number(d.qty) : 0,
    d.purchDate ? new Date(d.purchDate) : '',
    d.price ? Number(d.price) : '',
    d.winStart ? Number(d.winStart) : '', d.winEnd ? Number(d.winEnd) : '',
    d.status, d.rating, d.notes,
    new Date()                       // U: Last Updated – automatic time-stamp
  ];
  sh.getRange(newRow, 2, 1, coreRow.length).setValues([coreRow]);
  sh.getRange(newRow, 14).setNumberFormat('dd mmm yyyy'); // Purchase Date
  sh.getRange(newRow, 21).setNumberFormat('dd mmm yyyy'); // Last Updated

  // Column A (Photo) and V (Drink Status): copy the formulas down from row 2
  // so the new row stays consistent with the rest of the sheet.
  sh.getRange(2, 1).copyTo(sh.getRange(newRow, 1), { contentsOnly: false });
  sh.getRange(2, 22).copyTo(sh.getRange(newRow, 22), { contentsOnly: false });

  // Columns W-AB (23-28): critic scores
  const scoreRow = [
    d.halliday ? Number(d.halliday) : '',
    d.hook ? Number(d.hook) : '',
    d.rp ? Number(d.rp) : '',
    d.larkin ? Number(d.larkin) : '',
    d.myScore ? Number(d.myScore) : '',
    d.others || ''
  ];
  sh.getRange(newRow, 23, 1, scoreRow.length).setValues([scoreRow]);

  // Column AC (29): Storage Location
  sh.getRange(newRow, 29).setValue(d.location || '');

  return newId;
}

/** Refresh the Last Updated stamp on whatever row is currently selected. */
function restampActiveRow() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const r = sh.getActiveCell().getRow();
  if (r <= HEADER_ROW) { SpreadsheetApp.getUi().alert('Select a data row first.'); return; }
  sh.getRange(r, 21).setValue(new Date()).setNumberFormat('dd mmm yyyy');
}

/** (Re)applies dropdown validation to Type, Bottle Size, Country, Status, Personal Rating. */
function setupValidation() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const lists = {
    7:  ['Red','White','Sparkling','Rosé','Fortified','Dessert','Other'],           // G Type
    12: ['375ml','500ml','750ml','1000ml','1500ml','3000ml'],                       // L Bottle Size
    10: ['Australia','France','Italy','Spain','USA','New Zealand','Portugal','Germany','Argentina','Chile','South Africa','Other'], // J Country
    18: ['In Cellar','Reserved','Gifted','Drunk','Archived'],                       // R Status
    19: ['1','2','3','4','5']                                                       // S Personal Rating
  };
  Object.keys(lists).forEach(function (col) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(lists[col], true)
      .setAllowInvalid(false)
      .build();
    sh.getRange(2, Number(col), LAST_ROW - 1, 1).setDataValidation(rule);
  });
  SpreadsheetApp.getUi().alert('Dropdowns rebuilt on columns G, L, J, R, S (rows 2-' + LAST_ROW + ').');
}

/**
 * Creates three native Data ▸ Filter Views on the Cellar sheet:
 * "Ready to drink now", "Coming into window next year", "Quantity = 0".
 * Requires the Sheets API advanced service to be enabled:
 * Apps Script editor ▸ Services ▸ + ▸ Google Sheets API.
 */
function createFilterViews() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEET_NAME);
  const sheetId = sh.getSheetId();
  const nextYear = new Date().getFullYear() + 1;

  try {
    Sheets.Spreadsheets.get(ss.getId()); // touches the advanced service; throws if not enabled
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      'The "Sheets API" advanced service isn\'t enabled.\n\n' +
      'In the Apps Script editor: Services ▸ + ▸ Google Sheets API ▸ Add, then run ' +
      '"Rebuild Filter Views" again. (The Dashboard tab\'s live lists work either way.)'
    );
    return;
  }

  // 0-based column indices: M=Quantity(12), P=Drinking Window Start(15), V=Drink Status(21)
  const requests = [
    filterViewRequest_(sheetId, 'Ready to drink now', 21, {
      type: 'ONE_OF_LIST',
      values: [{ userEnteredValue: 'Ready' }, { userEnteredValue: 'Drink now' }]
    }),
    filterViewRequest_(sheetId, 'Coming into window ' + nextYear, 15, {
      type: 'NUMBER_EQ',
      values: [{ userEnteredValue: String(nextYear) }]
    }),
    filterViewRequest_(sheetId, 'Quantity = 0', 12, {
      type: 'NUMBER_EQ',
      values: [{ userEnteredValue: '0' }]
    })
  ];

  try {
    Sheets.Spreadsheets.batchUpdate({ requests: requests }, ss.getId());
    SpreadsheetApp.getUi().alert('Filter views created. Open Data ▸ Filter views to use them.');
  } catch (e) {
    SpreadsheetApp.getUi().alert('Could not create filter views: ' + e.message +
      '\n\n(If they already exist, delete the old ones with the same name from Data ▸ Filter views first.)');
  }
}

function filterViewRequest_(sheetId, title, colIndex, condition) {
  const criteria = {};
  criteria[colIndex] = { condition: condition };
  return {
    addFilterView: {
      filter: {
        title: title,
        range: {
          sheetId: sheetId,
          startRowIndex: 0,
          startColumnIndex: 0,
          endColumnIndex: 29 // A:AC
        },
        criteria: criteria
      }
    }
  };
}

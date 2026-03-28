/**
 * คัดลอกทั้งไฟล์ไปวางใน Google Apps Script (ข้างชีต)
 * จากนั้น Deploy → New deployment → Web app
 * - Execute as: Me
 * - Who has access: Anyone (หรือ Anyone with Google account ตามความเหมาะสม)
 * เอา URL ที่ได้ไปใส่ NEXT_PUBLIC_GOOGLE_SHEET_URL
 *
 * ใน Sheet แรก (Sheet1) ใส่หัวคอลัมน์แถวที่ 1:
 * id | name | stock | unit | lowStockThreshold
 * แถว 2 เป็นต้นไป = ข้อมูล (id ต้องตรงกับในแอป เช่น ing-dough)
 */

const SHEET_NAME = "Sheet1"
const HEADER = ["id", "name", "stock", "unit", "lowStockThreshold"]

function doGet(e) {
  const action = e && e.parameter && e.parameter.action
  if (action === "getStock") {
    return jsonResponse({ ingredients: readIngredients() })
  }
  return jsonResponse({ error: "Unknown action" }, 400)
}

function doPost(e) {
  const action = e && e.parameter && e.parameter.action
  if (action !== "updateStock") {
    return jsonResponse({ error: "Unknown action" }, 400)
  }
  let body
  try {
    body = JSON.parse(e.postData.contents || "{}")
  } catch (err) {
    return jsonResponse({ error: "Invalid JSON" }, 400)
  }
  const list = body.ingredients
  if (!Array.isArray(list)) {
    return jsonResponse({ error: "ingredients must be an array" }, 400)
  }
  writeIngredients(list)
  return jsonResponse({ ok: true })
}

function jsonResponse(obj, statusCode) {
  const out = ContentService.createTextOutput(JSON.stringify(obj))
  out.setMimeType(ContentService.MimeType.JSON)
  if (statusCode && statusCode >= 400) {
    // Apps Script ไม่มี status HTTP แบบเต็ม — ใช้ข้อความใน body แทน
  }
  return out
}

function readIngredients() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  if (!sh) throw new Error("Missing sheet: " + SHEET_NAME)
  const data = sh.getDataRange().getValues()
  if (data.length < 2) return []

  const header = data[0].map(String)
  const idx = {
    id: header.indexOf("id"),
    name: header.indexOf("name"),
    stock: header.indexOf("stock"),
    unit: header.indexOf("unit"),
    lowStockThreshold: header.indexOf("lowStockThreshold"),
  }
  if (idx.id < 0 || idx.name < 0 || idx.stock < 0 || idx.unit < 0 || idx.lowStockThreshold < 0) {
    throw new Error("Header row must include: id, name, stock, unit, lowStockThreshold")
  }

  const out = []
  for (let r = 1; r < data.length; r++) {
    const row = data[r]
    const id = String(row[idx.id] || "").trim()
    if (!id) continue
    const parsed = parseStockAndUnit(row[idx.stock], row[idx.unit])
    out.push({
      id: id,
      name: String(row[idx.name] || ""),
      stock: parsed.stock,
      unit: parsed.unit,
      lowStockThreshold: Number(row[idx.lowStockThreshold]) || 0,
    })
  }
  return out
}

/**
 * คอลัมน์ stock ควรเป็นตัวเลขล้วน; คอลัมน์ unit ควรเป็นหน่วยล้วน (เช่น cups)
 * ถ้า paste ผิดจน stock ว่างแต่ unit เป็น "30 cups" จะแยกให้อัตโนมัติ
 */
function parseStockAndUnit(stockCell, unitCell) {
  var unitStr = String(unitCell != null ? unitCell : "").trim()
  var raw = stockCell
  var hasStock =
    raw !== "" &&
    raw !== null &&
    raw !== undefined &&
    !(typeof raw === "string" && raw.trim() === "")

  if (hasStock) {
    var n = Number(raw)
    if (!isNaN(n)) {
      return { stock: n, unit: unitStr }
    }
  }

  var m = unitStr.match(/^(\d+(?:\.\d+)?)\s+(.+)$/)
  if (m) {
    return { stock: parseFloat(m[1]), unit: m[2].trim() }
  }

  var fallback = Number(raw)
  return { stock: isNaN(fallback) ? 0 : fallback, unit: unitStr }
}

function writeIngredients(ingredients) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  if (!sh) throw new Error("Missing sheet: " + SHEET_NAME)

  const byId = {}
  for (const ing of ingredients) {
    if (ing && ing.id) byId[String(ing.id)] = ing
  }

  const data = sh.getDataRange().getValues()
  if (data.length < 1) {
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER])
  }
  const header = data[0].map(String)
  const idx = {
    id: header.indexOf("id"),
    stock: header.indexOf("stock"),
  }
  if (idx.id < 0 || idx.stock < 0) {
    sh.clear()
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER])
    // rewrite all from ingredients
    const rows = ingredients.map(function (ing) {
      return [
        ing.id,
        ing.name,
        ing.stock,
        ing.unit,
        ing.lowStockThreshold,
      ]
    })
    if (rows.length) sh.getRange(2, 1, rows.length + 1, HEADER.length).setValues(rows)
    return
  }

  for (let r = 1; r < data.length; r++) {
    const id = String(data[r][idx.id] || "").trim()
    if (!id) continue
    const ing = byId[id]
    if (ing) {
      sh.getRange(r + 1, idx.stock + 1).setValue(Number(ing.stock))
    }
  }
}

/**
 * รันจาก Apps Script: เลือกฟังก์ชันนี้แล้วกด Run (แก้ชีตที่ stock ว่างแต่ unit เป็น "30 cups")
 * จะเขียนตัวเลขลงคอลัมน์ stock และหน่วยลงคอลัมน์ unit ให้แยกกัน
 */
function repairSheetColumns() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  const data = sh.getDataRange().getValues()
  if (data.length < 2) return

  const header = data[0].map(String)
  const idx = {
    stock: header.indexOf("stock"),
    unit: header.indexOf("unit"),
  }
  if (idx.stock < 0 || idx.unit < 0) return

  for (let r = 1; r < data.length; r++) {
    const row = data[r]
    const stockCell = row[idx.stock]
    const unitCell = String(row[idx.unit] || "").trim()
    const stockEmpty =
      stockCell === "" ||
      stockCell === null ||
      stockCell === undefined ||
      (typeof stockCell === "string" && stockCell.trim() === "")

    if (!stockEmpty) continue

    var m = unitCell.match(/^(\d+(?:\.\d+)?)\s+(.+)$/)
    if (!m) continue

    sh.getRange(r + 1, idx.stock + 1).setValue(parseFloat(m[1]))
    sh.getRange(r + 1, idx.unit + 1).setValue(m[2].trim())
  }
}

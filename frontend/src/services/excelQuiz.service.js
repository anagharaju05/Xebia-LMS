const REQUIRED_HEADERS = ["question", "option a", "option b", "correct answer"];

function normalize(value) {
  return String(value ?? "").trim();
}

function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(value); value = ""; }
    else value += char;
  }
  cells.push(value);
  return cells;
}

function csvRows(text) {
  return text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim()).map(parseCsvLine);
}

function rowsToQuestions(rows) {
  if (!rows.length) throw new Error("The spreadsheet is empty.");
  const headers = rows[0].map((cell) => normalize(cell).toLowerCase());
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}.`);
  const column = (name) => headers.indexOf(name);
  const questions = rows.slice(1).filter((row) => row.some((cell) => normalize(cell))).map((row, index) => {
    const prompt = normalize(row[column("question")]);
    const options = ["option a", "option b", "option c", "option d"].map((name) => column(name) >= 0 ? normalize(row[column(name)]) : "").filter(Boolean);
    const rawAnswer = normalize(row[column("correct answer")]);
    const letterIndex = /^[A-D]$/i.test(rawAnswer) ? rawAnswer.toUpperCase().charCodeAt(0) - 65 : -1;
    const answer = letterIndex >= 0 ? options[letterIndex] : options.find((option) => option.toLowerCase() === rawAnswer.toLowerCase());
    const marksColumn = column("marks");
    const explanationColumn = column("explanation");
    const marks = marksColumn >= 0 && Number(row[marksColumn]) > 0 ? Number(row[marksColumn]) : 1;
    if (!prompt) throw new Error(`Row ${index + 2}: Question is required.`);
    if (options.length < 2) throw new Error(`Row ${index + 2}: Add at least Option A and Option B.`);
    if (!answer) throw new Error(`Row ${index + 2}: Correct Answer must be A-D or match an option exactly.`);
    return { id: `quiz-question-${Date.now()}-${index}`, prompt, options, answer, marks, explanation: explanationColumn >= 0 ? normalize(row[explanationColumn]) : "" };
  });
  if (!questions.length) throw new Error("Add at least one quiz question below the header row.");
  return questions;
}

export async function parseQuizSpreadsheet(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let rows;
  if (extension === "csv") rows = csvRows(await file.text());
  else if (extension === "xlsx") {
    const { default: readXlsxFile } = await import("read-excel-file/browser");
    const result = await readXlsxFile(file);
    // Handle both older 2D array output and modern sheet object list output
    if (Array.isArray(result) && result.length > 0 && !Array.isArray(result[0]) && result[0].data) {
      rows = result[0].data;
    } else {
      rows = result;
    }
  } else throw new Error("Choose an .xlsx or .csv file.");
  const questions = rowsToQuestions(rows);
  return { questions, totalMarks: questions.reduce((sum, question) => sum + question.marks, 0) };
}

export const QUIZ_EXCEL_COLUMNS = ["Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Marks", "Explanation"];

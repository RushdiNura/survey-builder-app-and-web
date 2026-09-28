const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const Survey = require("../models/Survey");
const Response = require("../models/Response");

// GET /api/analytics/:surveyId
exports.getAnalytics = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.surveyId, owner: req.user._id });
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const responses = await Response.find({ survey: survey._id });
    const totalResponses = responses.length;

    // Completion rate: % of responses that answered every question on the survey
    const totalQuestions = survey.questions.length;
    const completed = responses.filter((r) => r.answers.length >= totalQuestions).length;
    const completionRate = totalResponses ? Math.round((completed / totalResponses) * 100) : 0;

    // Per-question breakdown
    const perQuestion = survey.questions.map((q) => {
      const qAnswers = responses
        .flatMap((r) => r.answers)
        .filter((a) => String(a.questionId) === String(q._id));

      let breakdown = null;
      let average = null;

      if (["multiple-choice", "checkboxes", "dropdown", "yes-no"].includes(q.type)) {
        const counts = {};
        qAnswers.forEach((a) => {
          const values = Array.isArray(a.value) ? a.value : [a.value];
          values.forEach((v) => {
            counts[v] = (counts[v] || 0) + 1;
          });
        });
        breakdown = counts;
      }

      if (q.type === "rating") {
        const nums = qAnswers.map((a) => Number(a.value)).filter((n) => !Number.isNaN(n));
        average = nums.length ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : null;
      }

      return {
        questionId: q._id,
        question: q.question,
        type: q.type,
        responseCount: qAnswers.length,
        breakdown,
        average,
      };
    });

    // Overall average rating (across all rating-type questions)
    const ratingQuestions = perQuestion.filter((q) => q.average !== null);
    const averageRating = ratingQuestions.length
      ? Number((ratingQuestions.reduce((a, b) => a + b.average, 0) / ratingQuestions.length).toFixed(2))
      : null;

    // Response trend by day
    const trendMap = {};
    responses.forEach((r) => {
      const day = r.submittedAt.toISOString().slice(0, 10);
      trendMap[day] = (trendMap[day] || 0) + 1;
    });
    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, count]) => ({ date, count }));

    res.json({
      totalResponses,
      completionRate,
      averageRating,
      trend,
      perQuestion,
    });
  } catch (err) {
    next(err);
  }
};

// Flattens responses into one row per response, one column per question —
// shared by all three export formats so they stay consistent.
function formatAnswerValue(value) {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join("; ");
  if (typeof value === "object") return value.url || value.name || JSON.stringify(value);
  return value;
}

function buildExportRows(survey, responses) {
  return responses.map((r) => {
    const row = {
      responseId: r._id.toString(),
      submittedAt: r.submittedAt.toISOString(),
      respondent: r.respondent ? r.respondent.toString() : "anonymous",
    };
    survey.questions.forEach((q) => {
      const answer = r.answers.find((a) => String(a.questionId) === String(q._id));
      row[q.question] = answer ? formatAnswerValue(answer.value) : "";
    });
    return row;
  });
}

// GET /api/analytics/:surveyId/export?format=csv|excel|pdf
exports.exportResponses = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.surveyId, owner: req.user._id });
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const format = (req.query.format || "csv").toLowerCase();
    const responses = await Response.find({ survey: survey._id }).sort("submittedAt");
    const rows = buildExportRows(survey, responses);
    const baseName = survey.title.replace(/\s+/g, "_").replace(/[^\w-]/g, "");
    const columns = ["responseId", "submittedAt", "respondent", ...survey.questions.map((q) => q.question)];

    if (format === "csv") {
      const parser = new Parser({ fields: columns });
      const csv = rows.length ? parser.parse(rows) : columns.join(",");
      res.header("Content-Type", "text/csv");
      res.attachment(`${baseName}_responses.csv`);
      return res.send(csv);
    }

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Survey Builder";
      workbook.created = new Date();
      const sheet = workbook.addWorksheet("Responses");

      sheet.columns = columns.map((c) => ({
        header: c,
        key: c,
        width: c === "responseId" ? 26 : Math.min(Math.max(c.length + 4, 14), 40),
      }));
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAEDFF" } };
      rows.forEach((row) => sheet.addRow(row));
      sheet.views = [{ state: "frozen", ySplit: 1 }];
      sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

      res.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.attachment(`${baseName}_responses.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 48, size: "A4" });
      res.header("Content-Type", "application/pdf");
      res.attachment(`${baseName}_responses.pdf`);
      doc.pipe(res);

      doc.fontSize(18).font("Helvetica-Bold").text(survey.title);
      doc.fontSize(10).font("Helvetica").fillColor("#555").text(`Exported ${new Date().toLocaleString()}`);
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#000").text(`Total responses: ${responses.length}`);
      doc.moveDown(1);
      doc.moveTo(doc.x, doc.y).lineTo(547, doc.y).strokeColor("#ddd").stroke();
      doc.moveDown(1);

      if (responses.length === 0) {
        doc.fontSize(11).fillColor("#666").text("No responses yet.");
      }

      responses.forEach((r, i) => {
        if (doc.y > 700) doc.addPage();
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#000")
          .text(`Response ${i + 1}`, { continued: true })
          .font("Helvetica")
          .fillColor("#888")
          .fontSize(9)
          .text(`   ${r.submittedAt.toLocaleString()}`);
        doc.moveDown(0.3);

        survey.questions.forEach((q) => {
          const answer = r.answers.find((a) => String(a.questionId) === String(q._id));
          const value = answer ? String(formatAnswerValue(answer.value) || "—") : "—";
          if (doc.y > 730) doc.addPage();
          doc.fontSize(10).font("Helvetica-Bold").fillColor("#333").text(q.question);
          doc.fontSize(10).font("Helvetica").fillColor("#000").text(value);
          doc.moveDown(0.3);
        });
        doc.moveDown(0.6);
        doc.moveTo(doc.x, doc.y).lineTo(547, doc.y).strokeColor("#eee").stroke();
        doc.moveDown(0.6);
      });

      doc.end();
      return;
    }

    res.status(400).json({ message: "Unsupported format. Use csv, excel, or pdf." });
  } catch (err) {
    next(err);
  }
};

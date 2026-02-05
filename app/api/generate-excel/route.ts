import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { jiraTicketKey, useReasoning = false } = await req.json();
    console.log("Received Jira Ticket Key:", jiraTicketKey);
    console.log("Use Reasoning:", useReasoning);

    // 1. Forward to the external DeepSeek Backend (provided by your colleague)
    const backendUrl = "http://localhost:5000/api/generate-testcases";
    const response = await axios.post(backendUrl, {
      jiraTicketKey,
      useReasoning,
    });

    console.log("Response from DeepSeek Backend:", response.data);

    const testCasesArray = response.data?.data?.testCases;

    const backendSummary =
      response.data?.message ||
      response.data?.summary ||
      `SIT Test Cases for ${jiraTicketKey}`;

    // Validation: Ensure we have an array to prevent the .forEach crash
    if (!testCasesArray || !Array.isArray(testCasesArray)) {
      console.error(
        "Data error: Expected an array in response.data.data.testCases",
      );
      return NextResponse.json(
        { error: "Backend did not return a valid test case array" },
        { status: 500 },
      );
    }

    // 2. Initialize Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SIT Test Cases");

    // 3. Define Predefined Headers
    worksheet.columns = [
      { header: "Sr.No", key: "srNo", width: 8 },
      { header: "Testcase_ID", key: "testCaseId", width: 15 },
      { header: "TEST", key: "test", width: 50 },
      { header: "Expected Result", key: "expectedResult", width: 40 },
      { header: "Actual Result", key: "actualResult", width: 20 },
      { header: "Status", key: "status", width: 12 },
      { header: "Type", key: "type", width: 12 },
    ];

    // 4. Professional Styling (Blue Header)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // 5. Populate Data from JSON
    testCasesArray.forEach((item, index) => {
      worksheet.addRow({
        srNo: index + 1,
        testCaseId: item.TestCaseId || item.testCaseId || `TC-0${index + 1}`,
        test: item.Test || item.description || "",
        expectedResult: item.Expected_Result || "",
        actualResult: "",
        status: "",
        type: item.type || "Positive",
      });
    });

    // 6. Add Borders and Text Wrapping
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (rowNumber > 1) {
          cell.alignment = { wrapText: true, vertical: "top" };
        }
      });
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();

    const base64Excel = Buffer.from(excelBuffer as ArrayBuffer).toString(
      "base64",
    );

    return NextResponse.json({
      success: true,
      ticketId: jiraTicketKey,
      summary: backendSummary,
      testCases: testCasesArray,
      excelFile: base64Excel,
    });
  } catch (error: any) {
    console.error("BFF Error:", error.message);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

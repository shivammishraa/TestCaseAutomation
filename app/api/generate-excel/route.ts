import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { jiraTicketKey } = await req.json();

    // 1. Fetch the JSON generated earlier by the backend
    // Assuming backend stores it and has a GET endpoint
    const backendResponse = await axios.get(`http://localhost:5000/api/get-testcases/${jiraTicketKey}`);
    const testCasesArray = backendResponse.data?.data?.testCases;

    if (!testCasesArray) throw new Error("No data found");

    // 2. Excel Generation Logic
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SIT Test Cases");

    worksheet.columns = [
      { header: "Sr.No", key: "srNo", width: 8 },
      { header: "Testcase_ID", key: "testCaseId", width: 15 },
      { header: "TEST", key: "test", width: 50 },
      { header: "Expected Result", key: "expectedResult", width: 40 },
      { header: "Actual Result", key: "actualResult", width: 20 },
      { header: "Status", key: "status", width: 12 },
      { header: "Type", key: "type", width: 12 },
    ];

    // Styling ... 
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    });

    testCasesArray.forEach((item: any, index: number) => {
      worksheet.addRow({
        srNo: index + 1,
        testCaseId: item.TestCaseId || item.testCaseId || `TC-0${index + 1}`,
        test: item.Test || item.description || "",
        expectedResult: item.Expected_Result || "",
        actualResult: "", status: "",
        type: item.type || "Positive",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="SIT_${jiraTicketKey}.xlsx"`
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
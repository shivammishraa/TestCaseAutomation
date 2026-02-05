import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { jiraTicketKey, useReasoning = false } = await req.json();
    console.log("Received Jira Ticket Key:", jiraTicketKey);
    console.log("Use Reasoning:", useReasoning);

    // 1. Forward to the external DeepSeek Backend (provided by your colleague)
    // Replace with the actual URL when ready
    const backendUrl = "http://localhost:5000/api/generate-testcases";
    const response = await axios.post(backendUrl, {
      jiraTicketKey,
      useReasoning
    });

    console.log("Response from DeepSeek Backend:", response.data);

    // // The JSON provided in your reference
    const json_data = response.data.json_data;


    // // 1. Fetch JSON from the DeepSeek Backend (Colleague's API)
    // // If the backend isn't ready, we use "Mock Data" as a fallback so your POC doesn't break
    // // let json_data;
    // // try {
    // //     const response = await axios.post("YOUR_COLLEAGUE_BACKEND_URL", { ticketId }, { timeout: 5000 });
    // //     json_data = response.data.json_data;
    // // } catch (e) {
    // //     // FALLBACK MOCK DATA for POC stability
    // //     json_data = [
    // //         { "testCaseId": "TC001", "Test": "Verify Login Flow", "Expected_Result": "User reaches dashboard" },
    // //         { "testCaseId": "TC002", "description": "Verify Logout", "Expected_Result": "User reaches login page" }
    // //     ];
    // // }

    // 2. Initialize Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('SIT Test Cases');

    // 3. Define Predefined Headers
    worksheet.columns = [
      { header: 'Sr.No', key: 'srNo', width: 8 },
      { header: 'Testcase_ID', key: 'testCaseId', width: 15 },
      { header: 'TEST', key: 'test', width: 50 },
      { header: 'Expected Result', key: 'expectedResult', width: 40 },
      { header: 'Actual Result', key: 'actualResult', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Type', key: 'type', width: 12 },
    ];

    // 4. Professional Styling (Blue Header)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' }, // Royal Blue
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 5. Populate Data from JSON
    json_data.forEach((item: any, index: number) => {
      worksheet.addRow({
        srNo: index + 1, // Auto-generated
        testCaseId: item.testCaseId,
        // Precise Logic: check for "Test" key, fallback to "description"
        test: item.Test || item.description || '',
        expectedResult: item.Expected_Result || '',
        actualResult: '', // Empty for tester
        status: '',       // Empty for tester
        type: '',         // Empty for tester
      });
    });

    // 6. Add Borders and Text Wrapping
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowNumber > 1) {
          cell.alignment = { wrapText: true, vertical: 'top' };
        }
      });
    });

    // 7. Generate Buffer and Return File
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="SIT_TestCases_${jiraTicketKey}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error: any) {
    console.error('BFF Error:', error);
    return NextResponse.json({ error: 'Failed to process test cases' }, { status: 500 });
  }
}
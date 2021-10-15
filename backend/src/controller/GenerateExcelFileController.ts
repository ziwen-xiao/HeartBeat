import { body, Context, description, request, summary, tagsAll } from "koa-swagger-decorator";
import { GenerateExcelRequest, GenerateReportRequest } from "../contract/GenerateReporter/GenerateReporterRequestBody";
import { GenerateExcelService } from "../services/common/GenarateExcelService";

@tagsAll(["GenerateReporter"])
export default class GenerateExcelFileController {
  @request("post", "/exportExcel")
  @summary("exportExcel")
  @description("exportExcel")
  // @body(GenerateExcelRequest as any)
  @body(GenerateReportRequest as any)
  public static async exportExcel(
    ctx: Context
  ): Promise<void> {
    const request: GenerateReportRequest = ctx.validatedBody;
    console.log("good news");
    console.log(request);
    // ctx.response.body = await new GenerateExcelService().testConnection(request);
    ctx.response.body = await new GenerateExcelService().generateExcel(request);
    console.log("hahahahahahah!!!!!");
  }
}
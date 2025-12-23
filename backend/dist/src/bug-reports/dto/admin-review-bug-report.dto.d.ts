export declare enum AdminBugReportAction {
    APPROVE = "APPROVE",
    REJECT = "REJECT"
}
export declare class AdminReviewBugReportDto {
    action: AdminBugReportAction;
    comment?: string;
}

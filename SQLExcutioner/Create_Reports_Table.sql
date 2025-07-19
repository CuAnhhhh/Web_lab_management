CREATE TABLE Reports (
    ReportId varchar(36),
    RelationshipId varchar(36),
    StudentId varchar(36),
    ProjectId varchar(36),
    Comment varchar(2000),
    StudentReport varchar(2000),
	ReportedDate datetime,
	ReportedWeek int,
	IsProjectReport bit
);
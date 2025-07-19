Create table Projects (
	ProjectId varchar(36),
	ProjectName varchar(100),
	Description varchar(1000),
	ProjectTypeId varchar(36),
	Collaboration bit,
	TotalMember int,
	IsActive bit,
	Reason varchar(1000),
	CreatedBy varchar(36),
	CreatedDate datetime,
	RemovedBy varchar(36),
	RemovedDate datetime
)
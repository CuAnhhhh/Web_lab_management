CREATE TABLE ProjectStudentRelationship (
RelationshipId varchar(36),
    ProjectId varchar(36),
    StudentId varchar(36),
	IsLeader bit,
	CreatedDate datetime,
	CreatedBy varchar(36),
	RemovedDate datetime,
	RemovedBy varchar(36),
	Status int,
);